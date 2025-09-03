import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";
import { formatDate } from "../../../../../lib/plans";

export interface UserPlan {
  price_at_purchase: number;
  subscription_id: string;
  last_transaction_id: string;
  created_at: string;
  expires_at: string;
  status: string;
  plan_id: string;
  plan_slug: string;
  plan_type: string;
  automatic_renewal: boolean;
}

export interface UserProfile {
  full_name: string;
  phone: string;
  email: string;
  identity: string;
  created_at: string;
  updated_at: string;
  link_app: string;
  link_share_app: string;
  slug_link: string;
  birthdate: string;
}

export async function POST(request: NextRequest) {
  try {
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
      console.log("Não foi possível encontrar plano de usuário: ", errorPlan);
      return NextResponse.json(
        { message: "Não foi possível encontrar plano de usuário" },
        { status: 404 }
      );
    }

    const { data: whatsPlan, error: errorWhatsPlan } = await supabaseAdmin
      .from("plans")
      .select("*")
      .eq("id", userPlan.plan_id)
      .single();

    if (errorWhatsPlan) {
      console.log("Plano não existe: ", errorWhatsPlan);
      return NextResponse.json(
        { message: "Plano do usuário não existe" },
        { status: 404 }
      );
    }

    const planOfUser: UserPlan = {
      price_at_purchase: userPlan.price_at_purchase,
      subscription_id: userPlan.subscription_id,
      last_transaction_id: userPlan.last_transaction_id,
      created_at: userPlan.created_at,
      expires_at: userPlan.expires_at,
      status: userPlan.status,
      plan_id: whatsPlan.id,
      plan_slug: whatsPlan.slug,
      plan_type: whatsPlan.type,
      automatic_renewal: userPlan.automatic_renewal,
    };

    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", user.user?.id)
      .single();

    if (profileError) {
      console.log("Perfil não encontrado: ", profileError);
      return NextResponse.json(
        { message: "Perfil não encontrado" },
        { status: 404 }
      );
    }

    if (userPlan.status === "active") {
      const createdAt = new Date(userPlan.created_at);
      const today = new Date();
      const differenceDays = today.getTime() - createdAt.getTime();
      const convertDays = differenceDays / (1000 * 60 * 60 * 24);

      if (
        (userPlan.slug_plan_at_moment === "trial_plan" && convertDays >= 7) ||
        (userPlan.slug_plan_at_moment === "annual_plan" &&
          convertDays >= 365) ||
        (userPlan.slug_plan_at_moment === "monthly_plan" && convertDays >= 31)
      ) {
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

    const profile: UserProfile = {
      full_name: userProfile.full_name,
      phone: userProfile.phone,
      email: userProfile.email,
      identity: userProfile.identity,
      created_at: userProfile.created_at,
      updated_at: userProfile.updated_at,
      link_app: userProfile.link_app,
      link_share_app: userProfile.link_share_app,
      slug_link: userProfile.slug_link,
      birthdate: userProfile.birthdate,
    };
    return NextResponse.json({ profile, planOfUser }, { status: 200 });
  } catch (error) {
    console.error("Erro interno no servidor: ", error);
    return NextResponse.json(
      { message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
