import { NextResponse, NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";

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

  const { data: userPlan, error: errorPlan } = await supabaseAdmin
    .from("users_plan")
    .select("*")
    .eq("user_id", user.user?.id)
    .single();

  if (errorPlan) {
    console.log("Não foi possível encontrar o plano do usuário: ", errorPlan);
    return NextResponse.json(
      { message: "Não foi possível encontrar o plano do usuário" },
      { status: 500 }
    );
  }

  if (userPlan) {
    const { error: errorUpdateProfile } = await supabaseAdmin
      .from("profiles")
      .update({ whats_plan: userPlan.slug_plan_at_moment })
      .eq("id", user.user?.id);

    if (errorUpdateProfile) {
      console.log("Não foi possível atualizar o plano do usuário.");
      return NextResponse.json(
        { message: "Não foi possível atualizar o plano do usuário" },
        { status: 500 }
      );
    }
  }

  const { data: userProfile } = await supabaseServer
    .from("profiles")
    .select("*")
    .eq("id", user.user?.id)
    .single();

  //console.log("UserProfile: ", userProfile);

  if (userPlan.status === "active") {
    const createdAt = new Date(userPlan.created_at);
    const today = new Date();
    const differenceDays = today.getTime() - createdAt.getTime();
    const convertDays = differenceDays / (1000 * 60 * 60 * 24);

    if (userPlan.slug_plan_at_moment === "trial_plan" && convertDays >= 7) {
      const { error } = await supabaseAdmin
        .from("users_plan")
        .update({ status: "expired" })
        .eq("user_id", user.user?.id);

      if (error) {
        console.log("Erro ao buscar dados, e cancelar plano gratuito", error);
        return NextResponse.json(
          { message: "Erro ao buscar dados, e cancelar plano gratuito" },
          { status: 500 }
        );
      }
    }
  }

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
