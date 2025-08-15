import { createClient } from "@supabase/supabase-js";
import { NextResponse, NextRequest } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";

interface DataPlan {
  id: string;
  popular: boolean;
  slug: string;
  type: string;
  price: number;
  pricePrevious: number;
  features: [];
  created_at: string;
  updated_at: string;
  status: string;
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");

  const body = await request.json();
  //console.log("whats_plan: ", body);

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
    .eq("id", user.user?.id);

  // Verifica se o usuário existe na users_plan - VERIFICA SE TEM PLANO
  const { data: userPlan, error: errorUserPlan } = await supabaseAdmin
    .from("users_plan")
    .select("*")
    .eq("user_id", user.user?.id)
    .single();

  if (errorUserPlan) {
    console.log("Usuário com plano não encontrado: ", errorUserPlan);
    return NextResponse.json(
      { message: "Usuário com plano não encontrado." },
      { status: 404 }
    );
  }

  if (body !== null) {
    const { data: dataPlan, error: errorDataPlan } = await supabaseServer
      .from("plans")
      .select("*")
      .eq("id", userPlan.plan_id)
      .single();

    if (errorDataPlan || !dataPlan) {
      console.log("Plano não encontrado: ", errorDataPlan);
      return NextResponse.json(
        { message: "Plano não encontrado." },
        { status: 404 }
      );
    }

    const formattedPlan: DataPlan = {
      id: dataPlan.id,
      popular: dataPlan.popular,
      slug: dataPlan.slug,
      type: dataPlan.type,
      price: dataPlan.price,
      pricePrevious: dataPlan.priceprevious,
      features: dataPlan.features,
      created_at: dataPlan.created_at,
      updated_at: dataPlan.updated_at,
      status: userPlan.status,
    };

    return NextResponse.json({
      plan: formattedPlan,
    });
  } else {
    return NextResponse.json(
      {
        hasPlan: false,
        message: "Não foi possível encontrar um plano do usuário.",
      },
      { status: 200 }
    );
  }
}
