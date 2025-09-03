import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../../../lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const { userPlan, userProfile } = await request.json();
    console.log(userPlan);
    console.log(userProfile);

    const secret_key = process.env.PAGARME_SECRET_TEST_KEY;
    const authHeader =
      "Basic " + Buffer.from(`${secret_key}:`).toString("base64");

    const dataBody = {
      cancel_pending_invoices: true,
    };

    const response = await fetch(
      `https://api.pagar.me/core/v5/subscriptions/${userPlan.subscription_id}?cancel_pending_invoices=true`,
      {
        method: "DELETE",
        headers: {
          Authorization: authHeader,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataBody),
      }
    );

    const data = await response.json();
    console.log("DATA:", data);

    const { error: updateUser } = await supabaseAdmin
      .from("users_plan")
      .update({
        status: "canceled",
        automatic_renewal: false,
        canceled_at: data.canceled_at,
      })
      .eq("user_id", userProfile.user_id);

    if (updateUser) {
      console.error("Não foi possível atualizar plano de usuário:", updateUser);
      return NextResponse.json(
        {
          message:
            "Não foi possível atualizar plano do usuário ou encontrar usuário.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Assinatura cancelada com sucesso." },
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
