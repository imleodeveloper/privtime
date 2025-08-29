import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../../lib/supabaseAdmin";

export interface UserPayments {
  transaction_id: string;
  subscription_id: string;
  price: string;
  type: string;
  payment_method: string;
  currency: string;
  paid_at: string;
  refund_at: string;
  status: string;
  created_at: string;
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");

    const supabaseServer = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${token}` } },
      }
    );

    const { data: user } = await supabaseServer.auth.getUser();

    if (!user) {
      return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
    }

    const { data: userPayment, error: errorPayment } = await supabaseAdmin
      .from("history_payments")
      .select("*")
      .eq("user_id", user.user?.id);

    if (errorPayment) {
      console.error("Erro ao procurar histórico de pagamentos:", errorPayment);
      //Não é um erro usuário pode não ter pagamento, pode seguir.
    }

    if (userPayment && userPayment.length > 0) {
      const userPayments: UserPayments[] = userPayment.map(
        (payment: UserPayments) => ({
          transaction_id: payment.transaction_id,
          subscription_id: payment.subscription_id,
          price: payment.price,
          type: payment.type,
          payment_method: payment.payment_method,
          currency: payment.currency,
          paid_at: payment.paid_at,
          refund_at: payment.refund_at,
          status: payment.status,
          created_at: payment.created_at,
        })
      );

      return NextResponse.json(
        { message: "Pagamentos encontrados", userPayments },
        { status: 200 }
      );
    }

    return NextResponse.json({ message: "OK" }, { status: 200 });
  } catch (error) {
    console.error("Erro interno no servidor:", error);
    return NextResponse.json(
      { message: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
