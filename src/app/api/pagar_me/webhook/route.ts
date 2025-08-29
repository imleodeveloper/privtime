import { NextResponse, NextRequest } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    console.log("Webhook recebido do Pagar.me:", payload);
    const eventType = payload.type;
    const data = payload.data;

    const metadata = data.metadata ?? {};

    const userId = metadata.user_id;
    const userLink = metadata.slug_link;
    const planLink = metadata.user_plan;
    const plan_id_pagarme = metadata.plan_id_pagarme;
    const planIdDbs = metadata.plan_id_dbs;

    const createdAt = new Date();

    function handleExpiresAt() {
      if (planLink === "monthly_plan" || planLink === "test_plan") {
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
    // console.log("Evento:", eventType);
    // console.log("Data:", data);

    if (eventType === "charge.created") {
      const { error } = await supabaseAdmin
        .from("users_plan")
        .update({
          status: "future",
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

    if (eventType === "charge.pending") {
      const { error } = await supabaseAdmin
        .from("users_plan")
        .update({ status: "pending" })
        .eq("user_id", userId);

      if (error) {
        console.log("Não foi possível atualizar o status do plano: ", error);
        return NextResponse.json(
          {
            message: "Erro ao atualizar plano",
          },
          { status: 500 }
        );
      }
    }

    const amount = data ? data.amount : data.minimum_price;

    if (eventType === "charge.paid") {
      const { error: errorUpdatedPlan } = await supabaseAdmin
        .from("users_plan")
        .update({
          plan_id: planIdDbs,
          slug_plan_at_moment: planLink,
          price_at_purchase: amount,
          subscription_id: data.invoice.subscriptionId,
          last_transaction_id: data.last_transaction?.id ?? null,
          created_at: createdAt,
          expires_at: handleExpires,
          status: "active",
        })
        .eq("user_id", userId);

      if (errorUpdatedPlan) {
        console.log("Não foi possível atualizar plano: ", errorUpdatedPlan);
        return NextResponse.json(
          { message: "Erro ao atualizar plano" },
          { status: 500 }
        );
      }

      const dateNow = new Date();
      const { error: errorUpdatedProfile } = await supabaseAdmin
        .from("profiles")
        .update({ whats_plan: planLink, updated_at: dateNow })
        .eq("id", userId)
        .select();

      if (errorUpdatedProfile) {
        console.log("Não foi possível atualizar perfil: ", errorUpdatedProfile);
        return NextResponse.json(
          { message: "Erro ao atualizar perfil" },
          { status: 404 }
        );
      }

      const checkTypePlan = () => {
        if (planLink) {
          if (planLink === "test_plan") {
            return "Teste";
          } else if (planLink === "monthly_plan") {
            return "Mensal";
          } else if (planLink === "annual_plan") {
            return "Anual";
          } else {
            return null;
          }
        } else {
          return null;
        }
      };
      const typePlan = checkTypePlan();

      const { data: checkTransactionId, error: checkError } =
        await supabaseAdmin
          .from("history_payments")
          .select("*")
          .eq("transaction_id", data.last_transaction.id)
          .single();

      if (checkError) {
        console.error("Erro ao consultar histórico: ", checkError);
      }

      if (!checkTransactionId) {
        const { error: historyPaymentError } = await supabaseAdmin
          .from("history_payments")
          .insert({
            slug_link: userLink,
            transaction_id: data.last_transaction.id,
            subscription_id: data.invoice.subscriptionId,
            price: amount,
            type: typePlan,
            currency: data.currency,
            payment_method: data.payment_method,
            paid_at: data.paid_at,
            status: data.status,
          });

        if (historyPaymentError) {
          console.log(
            "Não foi possível salvar o pagamento na tabela: ",
            historyPaymentError
          );
          return NextResponse.json(
            { message: "Erro ao salvar pagamento no histórico" },
            { status: 202 }
          );
        }
      }
    }

    if (eventType === "charge.payment_failed") {
      const { error } = await supabaseAdmin
        .from("users_plan")
        .update({
          status: "failed",
        })
        .eq("user_id", userId);

      if (error) {
        console.log("Não foi possível atualizar plano do usuário: ", error);
        return NextResponse.json(
          {
            message: "Não foi possível atualizar plano de usuário",
          },
          { status: 202 }
        );
      }
    }

    return NextResponse.json(
      {
        message: "Sucesso na compra da assinatura!",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro interno no servidor: ", error);
    return NextResponse.json(
      { message: "Erro interno no servidor", error },
      { status: 500 }
    );
  }
}
