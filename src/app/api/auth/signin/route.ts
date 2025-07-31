import { NextResponse } from "next/server";
import { supabase } from "../../../../../lib/supabase";

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

    console.log("data: ", data);

    if (error) {
      console.error("Erro no login: ", error.message);
      return NextResponse.json({ error: error.message }, { status: 401 });
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
