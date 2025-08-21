import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../../lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    const { data: userPlan, error: errorPlan } = await supabaseAdmin
      .from("users_plan")
      .select("subscription_id")
      .eq("user_id", userId)
      .single();

    const cancel_pending_invoices = true;

    const secret_key = process.env.PAGARME_SECRET_KEY;
    const authHeader =
      "Basic " + Buffer.from(`${secret_key}:`).toString("base64");

    const response = await fetch(
      `https://api.pagar.me/core/v5/subscriptions/${userPlan?.subscription_id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(cancel_pending_invoices),
      }
    );

    if (!response.ok) {
      console.log(
        "Não foi possível deletar assinatura: ",
        response.status,
        "/",
        response.statusText
      );
      return NextResponse.json(
        { message: "Não foi possível deletar assinatura, tente novamente." },
        { status: 500 }
      );
    }

    const data = await response.json();

    if (data) {
      return NextResponse.json(
        { message: "Assinatura cancelada com sucesso" },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Erro interno no servidor:", error);
    return NextResponse.json({ message: "Erro interno" }, { status: 500 });
  }
}
