import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../../lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const { userProfile, userChangeName } = await request.json();

    if (!userProfile || !userChangeName.newName) {
      return NextResponse.json(
        { message: "Informações necessárias não foram encontradas" },
        { status: 400 }
      );
    }

    if (userChangeName.newName == userProfile.full_name) {
      return NextResponse.json(
        {
          message: "O nome informado não pode ser o mesmo que o anterior",
        },
        { status: 400 }
      );
    }

    const isFullName = (name: string) => {
      // Remove espaços extras
      const trimmed = name.trim();

      // Deve ter pelo menos duas palavras
      const splitName = trimmed.split(/\s+/);
      if (splitName.length < 2) return false;

      // Cada palavra só letras (acentos ok)
      const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ]+$/;
      return splitName.every((word) => regex.test(word));
    };

    if (!isFullName(userChangeName.newName)) {
      return NextResponse.json(
        {
          message:
            "Informe um nome completo válido. Use apenas letras, acentos e espaços.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
      userProfile.user_id,
      {
        user_metadata: {
          full_name: userChangeName.newName,
        },
      }
    );

    if (error) {
      console.error("Erro ao alterar o nome:", error);
      return NextResponse.json(
        { message: "Não foi possível alterar o nome, erro do servidor" },
        { status: 500 }
      );
    }

    console.log(data);
    if (data) {
      const { error: errorOnProfile } = await supabaseAdmin
        .from("profiles")
        .update({ full_name: userChangeName.newName })
        .eq("id", userProfile.user_id);

      const { error: errorOnAdmins } = await supabaseAdmin
        .from("admins")
        .update({ name: userChangeName.newName })
        .eq("slug_link", userProfile.slug_link);

      if (errorOnProfile || errorOnAdmins) {
        const { error: updatedAgainOnAuth } =
          await supabaseAdmin.auth.admin.updateUserById(userProfile.user_id, {
            user_metadata: {
              full_name: userProfile.full_name,
            },
          });
        if (updatedAgainOnAuth) {
          console.error(
            "Não foi possível atualizar novamente para manter o mesmo nome: ",
            updatedAgainOnAuth
          );
        } else {
          return NextResponse.json(
            {
              message:
                "Não foi possível alterar o nome. Tente novamente mais tarde",
            },
            { status: 500 }
          );
        }
      }
    }

    return NextResponse.json(
      { message: "Nome alterado com sucesso!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro interno do servidor:", error);
    return NextResponse.json(
      { message: "Não foi possível trocar o nome, erro interno do servidor." },
      { status: 500 }
    );
  }
}
