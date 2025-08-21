import { NextResponse, NextRequest } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    console.log("Webhook recebido do Pagar.me:", payload);
    const eventType = payload.type;
    const data = payload.data;

    const externalReference =
      data.external_reference ?? data.charges?.[0].external_reference ?? null; // ${profile.slug_link}_${plan.link}_${profile.id}_plan-id=${plan_id}
    const parts = externalReference.split("_");
    const slugUser = parts[0];
    const planLink = parts[1];
    const userId = parts[2];
    const planIdPagarMe = parts[3];
    const planIdDbs = parts[4];

    const createdAt = new Date();

    function handleExpiresAt() {
      if (planLink === "monthly_plan") {
        const expiresAt = new Date(createdAt);
        expiresAt.setMonth(expiresAt.getMonth() + 1);
        return expiresAt;
      }

      if (planLink === "annual_plan") {
        const expiresAt = new Date(createdAt);
        expiresAt.setFullYear(expiresAt.getFullYear() + 1);
        return expiresAt;
      }

      return null;
    }

    const handleExpires = handleExpiresAt();
    console.log("Evento:", eventType);
    console.log("External Reference:", externalReference);

    if (eventType === "order.paid" || eventType === "charge.paid") {
      const { error } = await supabaseAdmin
        .from("users_plan")
        .update({
          plan_id: planIdDbs,
          slug_plan_at_moment: planLink,
          price_at_purchase: data.amount,
          subscription_id: data.id,
          last_transaction_id: data.charges[0].last_transaction.id,
          created_at: createdAt,
          expires_at: handleExpires,
          status: "active",
        })
        .eq("user_id", userId);

      if (error) {
        console.log("Não foi possível atualizar plano: ", error);
        return NextResponse.json(
          { message: "Erro ao atualizar plano" },
          { status: 500 }
        );
      }
    }

    if (
      eventType === "charge.payment_failed" ||
      eventType === "order.payment_failed"
    ) {
      const { error } = await supabaseAdmin
        .from("users_plan")
        .update({
          status: "failed",
        })
        .eq("user_id", userId);

      if (error) {
        console.log("Não foi possível atualizar plano do usuário: ", error);
        return NextResponse.json(
          { message: "Não foi possível atualizar plano de usuário" },
          { status: 500 }
        );
      }
    }
  } catch (error) {
    console.error("Erro interno no servidor: ", error);
    return NextResponse.json(
      { message: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
