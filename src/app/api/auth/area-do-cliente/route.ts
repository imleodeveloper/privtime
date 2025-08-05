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

  //console.log("UserProfile: ", userProfile);

  return NextResponse.json({
    user: {
      id: userProfile.id,
      full_name: userProfile.full_name,
      phone: userProfile.phone,
      email: userProfile.email,
      identity: userProfile.identity,
      whats_plan: userProfile.whats_plan,
      created_at: userProfile.created_at,
      updated_at: userProfile.updated_at,
      link_app: userProfile.link_app,
      link_share_app: userProfile.link_share_app,
      slug_link: userProfile.slug_link,
    },
  });
}
