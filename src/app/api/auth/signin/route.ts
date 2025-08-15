import { NextResponse } from "next/server";
import { supabase } from "../../../../../lib/supabase";
import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email.trim() || !password.trim() || !email || !password) {
      return NextResponse.json(
        { message: "Email e senha são obrigatórios" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      console.error("Erro no login: ", error.message);
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    if (error === "Invalid login credentials") {
      return NextResponse.json(
        {
          message: "Credênciais inválidas, ou email não possuí conta.",
        },
        { status: 401 }
      );
    }

    const { data: userPlanExist, error: userPlanError } = await supabaseAdmin
      .from("users_plan")
      .select("*")
      .eq("user_id", data.user.id)
      .single();

    if (userPlanError) {
      console.log("Plano não encontrado", userPlanError);
      // Não é um erro usuário pode não ter um plano
    }

    const createdAt = new Date(userPlanExist.created_at);
    const today = new Date();
    const differenceDays = today.getTime() - createdAt.getTime();
    const convertDays = differenceDays / (1000 * 60 * 60 * 24);
    console.log(convertDays);
    if (
      userPlanExist.slug_plan_at_moment === "trial_plan" &&
      convertDays >= 7
    ) {
      const { error } = await supabase
        .from("users_plan")
        .update({ status: "expired" })
        .eq("user_id", data.user.id);

      if (error) {
        console.log("Erro ao fazer login, e cancelar plano gratuito", error);
        return NextResponse.json(
          { message: "Erro ao fazer login, e cancelar plano gratuito" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        user: {
          id: data.user.id,
          email: data.user.email,
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro no servidor", error);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}
