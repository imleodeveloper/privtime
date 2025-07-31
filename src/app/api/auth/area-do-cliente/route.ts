import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
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

  const { data: userProfile } = await supabaseServer
    .from("profiles")
    .select("*")
    .eq("id", user.user?.id)
    .single();

  return NextResponse.json({ userProfile });
}
