import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../../lib/supabaseAdmin";
import { supabase } from "../../../../../../lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { message: "ID do usuário não fornecido", error: true },
        { status: 400 }
      );
    }

    const { error: errorDeleteUser } =
      await supabaseAdmin.auth.admin.deleteUser(userId);

    if (errorDeleteUser) {
      console.error("Erro ao deletar usuário:", errorDeleteUser);
      return NextResponse.json(
        { message: "Não foi possível deletar usuário", error: true },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Usuário deletado com sucesso", error: false },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro interno no servidor:", error);
    return NextResponse.json(
      {
        message:
          "Não foi possível excluir sua conta, tente novamente mais tarde.",
        error: true,
      },
      { status: 500 }
    );
  }
}
