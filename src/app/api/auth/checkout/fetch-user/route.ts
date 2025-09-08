import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../../lib/supabaseAdmin";

interface InfoUser {
  email: string;
  full_name: string;
  identity: string;
  phone: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Não foi possível encontrar o usuário:", error);
      return NextResponse.json(
        { message: "Não foi possível encontrar as informações do usuário" },
        { status: 404 }
      );
    }

    const phoneClean = data.phone.replace(/\D/g, "");
    const identityClean = data.identity.replace(/\D/g, "");

    const infoUser: InfoUser = {
      email: data.email,
      full_name: data.full_name,
      identity: identityClean,
      phone: phoneClean,
    };

    return NextResponse.json({ infoUser }, { status: 200 });
  } catch (error) {
    console.error("Não foi possível buscar informações do usuário: ", error);
    return NextResponse.json(
      {
        message:
          "Erro interno do servidor, não foi possível buscar informações do usuário",
      },
      { status: 500 }
    );
  }
}
