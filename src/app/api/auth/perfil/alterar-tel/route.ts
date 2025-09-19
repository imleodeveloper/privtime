import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../../lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const { userProfile, userChangeTel } = await request.json();

    if (!userProfile || !userChangeTel.newPhone) {
      return NextResponse.json(
        { message: "Informações necessárias não fornecidas." },
        { status: 400 }
      );
    }

    const phoneClear = userChangeTel.newPhone.replace(/\D/g, "");
    console.log(phoneClear);

    if (phoneClear.length !== 11) {
      return NextResponse.json(
        { message: "O telefone deve conter exatamente 11 dígitos" },
        { status: 400 }
      );
    }

    if (!phoneClear) {
      return NextResponse.json(
        { message: "O telefone deve conter somente caracteres numéricos" },
        { status: 400 }
      );
    }

    const { data: checkExistPhone, error: errorCheckPhone } =
      await supabaseAdmin
        .from("profiles")
        .select("phone")
        .eq("phone", userChangeTel.newPhone)
        .maybeSingle();

    if (errorCheckPhone) {
      console.error(
        "Não foi possível buscar número de telefone:",
        errorCheckPhone
      );
      return NextResponse.json(
        { message: "Não foi possível atualizar telefone, erro interno" },
        { status: 500 }
      );
    }

    if (checkExistPhone && checkExistPhone.phone) {
      return NextResponse.json(
        { message: "Esse número de telefone já existe, tente novamente." },
        { status: 400 }
      );
    } else {
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({ phone: userChangeTel.newPhone })
        .eq("id", userProfile.user_id);

      if (error) {
        console.error("Erro ao atualizar no banco de dados: ", error);
        return NextResponse.json(
          {
            message:
              "Não foi possível atualizar telefone, tente novamente mais tarde",
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          message:
            "Telefone atualizado com sucesso, mas lembre-se ainda é necessário fazer a verificação do telefone.",
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Erro interno do servidor:", error);
    return NextResponse.json(
      {
        message: "Não foi possível trocar o telefone, erro interno de servidor",
      },
      { status: 500 }
    );
  }
}
