import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../../../../../../lib/supabase";

// PATCH - Atualiza agendamentos status ou deleta (super admin)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { appointmentId, action } = body;

    if (!appointmentId || !action) {
      return NextResponse.json(
        { error: "ID do agendamento e ação são obrigatórios" },
        { status: 400 }
      );
    }

    if (action === "delete") {
      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", appointmentId);

      if (error) throw error;

      return NextResponse.json({ success: true }, { status: 200 });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    console.error("Erro ao processar agendamento:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
