import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../../lib/supabaseAdmin";

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

    console.log(userPayment);
  } catch (error) {
    console.error("Erro interno no servidor:", error);
    return NextResponse.json(
      { message: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
