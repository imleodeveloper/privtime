import { createClient } from "@supabase/supabase-js";
import { NextResponse, NextRequest } from "next/server";

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
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("Authorization")?.replace("Bearer ", "");

  const body = await request.json();
  console.log("whats_plan: ", body);

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

  console.log("user: ", user);

  const { data: userProfile } = await supabaseServer
    .from("profiles")
    .select("*")
    .eq("id", user.user?.id);

  console.log("UserProfile: ", userProfile);

  const { data: dataPlan } = await supabaseServer
    .from("plans")
    .select("*")
    .eq("slug", body)
    .single();

  console.log("dataPlan: ", dataPlan);

  if (!dataPlan) {
    NextResponse.json({ message: "Plano não encontrado." }, { status: 404 });
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
  };

  return NextResponse.json({
    plan: formattedPlan,
  });
}
