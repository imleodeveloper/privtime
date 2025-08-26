import { NextResponse, NextRequest } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    console.log("Webhook recebido do Pagar.me:", payload);
    const eventType = payload.type;
    const data = payload.data;

    const metadata = data.customer.metadata ?? {};
    console.log(metadata);

    const userId = metadata.user_id;
    const planLink = metadata.slug_link;
    const plan_id_pagarme = metadata.plan_id_pagarme;
    const planIdDbs = metadata.plan_id_dbs;

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
    console.log("Data:", data);
    if (data.last_transaction) {
      console.log("GateWay Response: ", data.last_transaction.gateway_response);
    }

    if (
      eventType === "subscription.created" ||
      eventType === "charge.created"
    ) {
      const { error } = await supabaseAdmin
        .from("users_plan")
        .update({
          status: "future",
        })
        .eq("user_id", userId);

      if (eventType === "subscription.created") {
        const { error } = await supabaseAdmin
          .from("users_plan")
          .update({
            subscription_id: data.id,
          })
          .eq("user_id", userId);

        if (error) {
          console.log("Não foi possível atualizar o id da assinatura: ", error);
          return NextResponse.json(
            { message: "Erro ao atualizar plano" },
            { status: 500 }
          );
        }
      }

      if (error) {
        console.log("Não foi possível atualizar plano: ", error);
        return NextResponse.json(
          { message: "Erro ao atualizar plano" },
          { status: 500 }
        );
      }
    }

    const amount = data ? data.amount : data.minimum_price;

    if (eventType === "charge.paid") {
      const { error } = await supabaseAdmin
        .from("users_plan")
        .update({
          plan_id: planIdDbs,
          slug_plan_at_moment: planLink,
          price_at_purchase: amount,
          subscription_id: data.id,
          last_transaction_id: data.last_transaction.id,
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
      eventType === "order.payment_failed" ||
      eventType === "invoice.payment_failed"
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

    return NextResponse.json({ message: "OK" }, { status: 200 });
  } catch (error) {
    console.error("Erro interno no servidor: ", error);
    return NextResponse.json(
      { message: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
