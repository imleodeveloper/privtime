import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../../../lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const { userPlan, userProfile } = await request.json();

    const secret_key = process.env.PAGARME_SECRET_TEST_KEY;
    const authHeader =
      "Basic " + Buffer.from(`${secret_key}:`).toString("base64");

    const response = await fetch(
      `https://api.pagar.me/core/v5/subscriptions/${userPlan.subscription_id}/manual-billing`,
      {
        method: "DELETE",
        headers: { Authorization: authHeader, Accept: "application/json" },
      }
    );

    const data = await response.json();

    if (!data.manual_billing) {
      const { error: errorUpdate } = await supabaseAdmin
        .from("users_plan")
        .update({
          automatic_renewal: true,
        })
        .eq("user_id", userProfile.user_id);

      if (errorUpdate) {
        console.log(
          "DISABLE MANUAL: Não foi possível encontrar usuário na tabela de planos de usuário: ",
          errorUpdate
        );
        return NextResponse.json({ status: 404 });
      }
    }

    return NextResponse.json(
      { message: "Renovação automática atualizada com sucesso!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro interno: ", error);
    return NextResponse.json(
      { message: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
