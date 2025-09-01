import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    const { data: hasPlan, error: errorHasPlan } = await supabaseAdmin
      .from("users_plan")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (errorHasPlan) {
      console.log("Não foi possível localizar plano de usuário:", errorHasPlan);
      //Não é um erro para mandar de volta ao login
    }

    if (hasPlan.slug_plan_at_moment !== "trial_plan") {
      // Redireciona para o login se já tiver plano
      return NextResponse.json(
        {
          message:
            "Usuário já possuí plano, caso necessite de reativação ou renovação de assinatura somente pelo perfil do cliente",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({ message: "OK" }, { status: 200 });
  } catch (error) {
    console.error("Erro interno: ", error);
    return NextResponse.json(
      { message: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
