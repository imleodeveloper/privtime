import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../../../../lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, slugUser } = body;

    if (!userId || !slugUser) {
      return NextResponse.json(
        { message: "É necessário estar logado para entrar no app do perfil." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("users_plan")
      .select("status")
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Não foi possível localizar plano do usuário:", error);
      return NextResponse.json(
        {
          message:
            "Não foi possível localizar plano do usuário, entrada ao app não autorizada",
        },
        { status: 404 }
      );
    }

    if (data?.status !== "active") {
      return NextResponse.json(
        {
          message:
            "É necessário reativar o plano para prosseguir utilizando o app.",
        },
        { status: 401 }
      );
    } else {
      return NextResponse.json({ status: 200 });
    }
  } catch (error) {
    console.error("Não foi possível verificar status de plano:", error);
    return NextResponse.json(
      {
        message:
          "Erro interno do servidor, não foi possível verificar status do plano.",
      },
      { status: 500 }
    );
  }
}
