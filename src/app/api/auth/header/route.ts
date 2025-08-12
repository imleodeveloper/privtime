import { NextResponse, NextRequest } from "next/server";
import { supabase } from "../../../../../lib/supabase";
import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  const { userId } = await request.json();

  try {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId.id)
      .single();

    if (error) {
      console.log("Não foi possível encontrar usuário:", error);
      return NextResponse.json(
        { message: "Não foi possível encontrar usuário" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        link_app: data.link_app,
        link_share_app: data.link_share_app,
        slug_link: data.slug_link,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Não foi possível fazer contato com o servidor: ", error);
    return NextResponse.json(
      { message: "Não foi possível fazer contato com o servidor" },
      { status: 500 }
    );
  }
}
