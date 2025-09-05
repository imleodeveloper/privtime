import { NextResponse, NextRequest } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !email.trim()) {
      return NextResponse.json(
        { message: "Informe um e-mail válido" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      console.log("Não foi possível localizar um e-mail:", error);
      return NextResponse.json(
        { message: "E-mail informado não localizado, tente outro e-mail" },
        { status: 404 }
      );
    }

    return NextResponse.json({ status: 200 });
  } catch (error) {
    console.error("Erro interno:", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
