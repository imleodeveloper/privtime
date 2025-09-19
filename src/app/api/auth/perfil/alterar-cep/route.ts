import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../../lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const { userProfile, userChangeAddress } = await request.json();

    if (!userProfile || !userChangeAddress.newAddress) {
      return NextResponse.json(
        { message: "Informações necessárias não fornecidas" },
        { status: 400 }
      );
    }

    const cepClean = userChangeAddress.newAddress.replace(/\D/g, "");
    let hasCEP = "";
    if (userProfile.cep !== null) {
      hasCEP = userProfile.cep;
    }
    const cepUserClean = hasCEP.replace(/\D/g, "");

    if (!cepClean) {
      return NextResponse.json(
        { message: "O CEP deve conter somente números" },
        { status: 400 }
      );
    }

    if (cepClean.length !== 8) {
      return NextResponse.json(
        {
          message: "O CEP deve conter somente 8 números",
        },
        { status: 400 }
      );
    }

    if (cepClean == cepUserClean) {
      return NextResponse.json(
        { message: "O CEP deve ser diferente do anterior" },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ cep: cepClean })
      .eq("id", userProfile.user_id);

    if (error) {
      console.error("Erro ao atualizar cep: ", error);
      return NextResponse.json(
        {
          message:
            "Não foi possível atualizar o CEP. Tente novamente mais tarde",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "CEP atualizado com sucesso!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao atualizar endereço:", error);
    return NextResponse.json(
      { message: "Não foi possível atualizar endereço, erro do servidor" },
      { status: 500 }
    );
  }
}
