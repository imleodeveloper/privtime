import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../../../lib/supabaseAdmin";
import { BusinessProfile } from "@/app/perfil/meu-negocio/page";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slugUser, userId } = body;

    if (!slugUser || !userId) {
      return NextResponse.json(
        { message: "Dados obrigatórios não encontrados" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("business_profiles")
      .select("*")
      .eq("user_id", userId)
      .eq("slug_link", slugUser)
      .single();

    if (!data) {
      const { data: dataInsert, error: errorInsert } = await supabaseAdmin
        .from("business_profiles")
        .insert({
          user_id: userId,
          slug_link: slugUser,
        })
        .select()
        .single();

      if (errorInsert) {
        return NextResponse.json(
          { message: "Não foi possível atualizar o meu negócio." },
          { status: 500 }
        );
      }

      const userBusiness: BusinessProfile = {
        address: dataInsert.address,
        audience: dataInsert.audience,
        business_name: dataInsert.business_name,
        presentation: dataInsert.presentation,
        cnpj_cpf: dataInsert.cnpj_cpf,
        updated_at: dataInsert.updated_at,
        links: dataInsert.links,
        phones: dataInsert.phones,
        dates_and_times: dataInsert.dates_and_times,
        photo_business: data.photo_business,
      };

      // Envia o data que foi criado
      return NextResponse.json({ userBusiness }, { status: 201 });
    } else {
      // Envia o data que já tem criado
      const userBusiness: BusinessProfile = {
        address: data.address,
        audience: data.audience,
        business_name: data.business_name,
        cnpj_cpf: data.cnpj_cpf,
        presentation: data.presentation,
        updated_at: data.updated_at,
        links: data.links,
        phones: data.phones,
        dates_and_times: data.dates_and_times,
        photo_business: data.photo_business,
      };
      return NextResponse.json({ userBusiness }, { status: 200 });
    }
  } catch (error) {
    console.error("Erro interno do servidor:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const { businessProfile, userId } = body;

    if (businessProfile.business_name.length > 30) {
      return NextResponse.json(
        { message: "O nome do negócio deve ter no máximo 30 caracteres." },
        { status: 400 }
      );
    }

    if (businessProfile.cnpj_cpf) {
      const cnpjOrCpfClean = businessProfile.cnpj_cpf.replace(/\D/g, "");

      if (!cnpjOrCpfClean) {
        return NextResponse.json(
          { message: "O campo CNPJ/CPF deve conter somente números" },
          { status: 400 }
        );
      }

      if (cnpjOrCpfClean.length !== 11 && cnpjOrCpfClean.length !== 14) {
        return NextResponse.json(
          {
            message:
              "O campo CNPJ/CPF deve ter 11 ou 14 caracteres. Exemplo: CPF: 000.000.000-00 / CNPJ: 00.000.000/0000-00",
          },
          { status: 400 }
        );
      }
    }

    if (businessProfile.presentation.length > 500) {
      return NextResponse.json(
        {
          message: "A carta de apresentação deve ter no máximo 500 caracteres.",
        },
        { status: 400 }
      );
    }

    if (businessProfile.phones && businessProfile.phones.length > 0) {
      for (let index = 0; index < businessProfile.phones.length; index++) {
        const phone = businessProfile.phones[index];
        const phoneClean = phone.replace(/\D/g, "");

        if (!phoneClean) {
          return NextResponse.json(
            {
              message: `O número de telefone-${
                index + 1
              } deve conter somente números`,
            },
            { status: 400 }
          );
        }

        if (phoneClean.length !== 11) {
          return NextResponse.json(
            {
              message: `O número de telefone-${
                index + 1
              } é inválido. Utilize um número válido como: (11) 91234-5678.`,
            },
            { status: 400 }
          );
        }
      }
    }

    if (businessProfile.address && businessProfile.address[0]) {
      const cleanCEP = businessProfile.address[0].replace(/\D/g, "");

      if (!cleanCEP) {
        return NextResponse.json(
          { message: "O CEP deve conter somente números." },
          { status: 400 }
        );
      }

      if (cleanCEP.length > 8) {
        return NextResponse.json(
          { message: "O campo CEP deve ter no máximo 8 caracteres." },
          { status: 400 }
        );
      }
    }

    const cnpjOrCpfClean = businessProfile.cnpj_cpf.replace(/\D/g, "");

    const { error: errorUpdate } = await supabaseAdmin
      .from("business_profiles")
      .update({
        business_name: businessProfile.business_name,
        cnpj_cpf: cnpjOrCpfClean,
        presentation: businessProfile.presentation,
        phones: businessProfile.phones,
        audience: businessProfile.audience,
        links: businessProfile.links,
        address: businessProfile.address,
        dates_and_times: businessProfile.dates_and_times,
        updated_at: new Date(),
        photo_business: businessProfile.photo_business,
      })
      .eq("user_id", userId);

    if (errorUpdate) {
      return NextResponse.json(
        { message: `Não foi possível atualizar 'Meu negócio' do usuário` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Meu negócio atualizado com sucesso." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro interno do servidor:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
