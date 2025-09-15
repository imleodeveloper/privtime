import { NextResponse } from "next/server";
import { supabase } from "../../../../../../../lib/supabase";
import { supabaseAdmin } from "../../../../../../../lib/supabaseAdmin";

// GET - Listar todos os profissionais
export async function GET() {
  try {
    const { data: professionals, error } = await supabase
      .from("professionals")
      .select(
        `
        *,
        professional_services(
          service:services(*)
        )
      `
      )
      .order("name", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ professionals }, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar profissionais:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// POST - Criar novo profissional (apenas super admin)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      slug_link,
      name,
      email,
      phone,
      specialties,
      serviceIds,
      photo_professional,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      );
    }

    const { data: lengthProfessional, error: lengthError } = await supabaseAdmin
      .from("professionals")
      .select("*")
      .eq("slug_link", slug_link);

    if (lengthError) {
      console.log("Não foi encontrado nenhum profissional");
      // Não é um erro, usuário pode não ter criado profissional
    }

    const quantityProf = lengthProfessional?.length;

    if (quantityProf && quantityProf > 5) {
      console.log(quantityProf);
      return NextResponse.json(
        { message: "Limite de profissionais atingidos, máximo: 5." },
        { status: 401 }
      );
    } else {
      // Criar profissional
      const { data: professional, error: profError } = await supabaseAdmin
        .from("professionals")
        .insert({
          slug_link,
          name,
          email: email || null,
          phone: phone || null,
          specialties: specialties || [],
          active: true,
          photo_professional,
        })
        .select()
        .single();

      if (profError) {
        if (profError.code === "23505") {
          return NextResponse.json(
            { message: "Email já está em uso" },
            { status: 400 }
          );
        }
        throw profError;
      }

      // Associar serviços se fornecidos
      if (serviceIds && serviceIds.length > 0) {
        const serviceRelations = serviceIds.map((serviceId: string) => ({
          slug_link,
          professional_id: professional.id,
          service_id: serviceId,
        }));

        const { error: serviceError } = await supabaseAdmin
          .from("professional_services")
          .insert(serviceRelations);

        if (serviceError) {
          console.error("Erro ao associar serviços:", serviceError);
        }
      }

      return NextResponse.json(
        { message: "Profissional criado com sucesso!", professional },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Erro ao criar profissional:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor. Não foi possível criar profissional.",
      },
      { status: 500 }
    );
  }
}

// PUT - Atualizar profissional (apenas super admin)
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { slug_link, id, name, email, phone, specialties, serviceIds } = body;

    if (!id || !name) {
      return NextResponse.json(
        { error: "ID e nome são obrigatórios" },
        { status: 400 }
      );
    }

    // Atualizar profissional
    const { data: professional, error: profError } = await supabaseAdmin
      .from("professionals")
      .update({
        name,
        email: email || null,
        phone: phone || null,
        specialties: specialties || [],
      })
      .eq("id", id)
      .select()
      .single();

    if (profError) throw profError;

    // Atualizar associações de serviços
    if (serviceIds !== undefined) {
      // Remover associações existentes
      await supabaseAdmin
        .from("professional_services")
        .delete()
        .eq("professional_id", id);

      // Adicionar novas associações
      if (serviceIds.length > 0) {
        const serviceRelations = serviceIds.map((serviceId: string) => ({
          slug_link,
          professional_id: id,
          service_id: serviceId,
        }));

        const { error: serviceError } = await supabaseAdmin
          .from("professional_services")
          .insert(serviceRelations);

        if (serviceError) {
          console.error("Erro ao associar serviços:", serviceError);
        }
      }
    }

    return NextResponse.json({ professional }, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar profissional:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

// DELETE - Remover profissional (apenas super admin)
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const professionalId = searchParams.get("id");

    if (!professionalId) {
      return NextResponse.json(
        { error: "ID do profissional não fornecido" },
        { status: 400 }
      );
    }

    // Verificar se há agendamentos associados
    const { data: appointments } = await supabaseAdmin
      .from("appointments")
      .select("id")
      .eq("professional_id", professionalId)
      .limit(1);

    if (appointments && appointments.length > 0) {
      return NextResponse.json(
        { error: "Não é possível excluir profissional com agendamentos" },
        { status: 400 }
      );
    }

    const { data: professionalData, error: fetchProfError } =
      await supabaseAdmin
        .from("professionals")
        .select("photo_professional")
        .eq("id", professionalId)
        .single();

    if (fetchProfError) throw fetchProfError;

    const photoPath = professionalData?.photo_professional;

    const bucketName = "photos_professionals";
    const encodedPath = photoPath.split(`${bucketName}/`)[1];

    //Deletar do Storage se existir;

    if (encodedPath) {
      const path = decodeURIComponent(encodedPath);
      const { error: storageError } = await supabaseAdmin.storage
        .from("photos_professionals")
        .remove([path]);

      if (storageError) {
        console.error("Erro ao deletar foto de profissional:", storageError);
      }
    }

    const { error } = await supabaseAdmin
      .from("professionals")
      .delete()
      .eq("id", professionalId);

    if (error) throw error;

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Erro ao deletar profissional:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
