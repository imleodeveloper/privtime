import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../../lib/supabaseAdmin";

interface UpdateProfile {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  identity: string;
  link_app: string;
  link_share_app: string;
  slug_link: string;
  edit_slug: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userProfile, userChangeSlug } = body;

    const slug = userChangeSlug.newSlug;
    const slugClean = slug.replace(/[^a-zA-Z0-9-_]/g, "");
    if (!slugClean) {
      return NextResponse.json(
        {
          message:
            "A slug deve conter somente letras, sem espaços, números, hífen e underscore (a-z, 0-9, - , _)",
        },
        { status: 400 }
      );
    }

    if (!slugClean.trim()) {
      return NextResponse.json(
        {
          message:
            "A slug não deve ser vazio, e deve conter pelo menos 6 caracteres.",
        },
        { status: 400 }
      );
    }

    if (slugClean.length < 6 || slugClean.length > 50) {
      return NextResponse.json(
        {
          message: "A slug deve conter entre 6 à 50 caracteres.",
        },
        { status: 400 }
      );
    }

    // Verifica se essa slug existe
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("slug_link", slugClean);

    if (error) {
      console.log("Erro ao verificar slug:", error);
      return NextResponse.json(
        { message: "Erro ao verificar se já existe slug" },
        { status: 500 }
      );
    }

    // se existir
    if (data.length > 0) {
      return NextResponse.json(
        {
          message:
            "Ops! Essa slug já existe. Escolha uma diferente para continuar.",
        },
        { status: 400 }
      );
    } else {
      const { data: editSlug, error: editSlugError } = await supabaseAdmin
        .from("profiles")
        .select("edit_slug")
        .eq("id", userProfile.user_id)
        .single();

      if (editSlugError) {
        console.error(
          "Não foi possível atualizar o perfil do usuário:",
          editSlugError
        );
        return NextResponse.json(
          {
            message:
              "Não foi possível atualizar para a nova slug, perfil não encontrado",
          },
          { status: 404 }
        );
      }

      let incrementEditSlug: number = editSlug.edit_slug;
      if (incrementEditSlug >= 2) {
        return NextResponse.json(
          {
            message:
              "Você já atingiu o máximo de alterações de slug. Caso precise alterar novamente entre em contato com o suporte.",
          },
          { status: 401 }
        );
      } else {
        incrementEditSlug += 1;

        // se não existir atualiza o profile
        const { data: updateProfile, error: errorUpdate } = await supabaseAdmin
          .from("profiles")
          .update({
            link_app: `${process.env.SHARE_LINK_APP_VIAMODELS}/${slugClean}/admin`,
            link_share_app: `${process.env.SHARE_LINK_APP_VIAMODELS}/${slugClean}/`,
            slug_link: slugClean,
            edit_slug: incrementEditSlug,
          })
          .eq("id", userProfile.user_id)
          .select()
          .single();

        if (errorUpdate) {
          console.error(
            "Não foi possível atualizar o perfil do usuário:",
            errorUpdate
          );
          return NextResponse.json(
            {
              message:
                "Não foi possível atualizar para a nova slug, perfil não encontrado",
            },
            { status: 404 }
          );
        }

        const profile: UpdateProfile = {
          id: updateProfile.id,
          full_name: updateProfile.full_name,
          phone: updateProfile.phone,
          email: updateProfile.email,
          identity: updateProfile.identity,
          link_app: updateProfile.link_app,
          link_share_app: updateProfile.link_share_app,
          slug_link: updateProfile.slug_link,
          edit_slug: updateProfile.edit_slug,
        };

        return NextResponse.json(
          { profile, message: "Sua slug foi atualizada com sucesso!" },
          { status: 200 }
        );
      }
    }
  } catch (error) {
    console.error("Erro interno do servidor:", error);
    return NextResponse.json(
      { message: "Não foi possível alterar slug, erro interno do servidor" },
      { status: 500 }
    );
  }
}
