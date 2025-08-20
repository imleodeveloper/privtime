import { NextResponse, NextRequest } from "next/server";

interface CreatePlanPagarMe {
  interval: string;
  interval_count: number;
  pricing_scheme: {
    scheme_type: string;
    price: number;
  };
  quantity: number;
  currency: string;
  billing_type: string;
  name: string;
  payment_methods: [string, string];
  minimum_price: number;
  statement_descriptor: string;
  trial_period_days: number;
  metadata: {};
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { plan, profile } = body;

  const interval = plan.type === "Mensal" ? "month" : "year";
  const amount = plan.type === "Mensal" ? 5819 : 57828;
  const name = plan.type === "Mensal" ? "Plano Mensal" : "Plano Anual";

  const createPlanPagarMe: CreatePlanPagarMe = {
    interval: interval,
    interval_count: 1,
    pricing_scheme: {
      scheme_type: "unit",
      price: amount,
    },
    quantity: 1,
    currency: "BRL",
    billing_type: "prepaid",
    name: name,
    payment_methods: ["credit_card", "boleto"],
    minimum_price: amount,
    statement_descriptor: "APPVIAMODELS",
    trial_period_days: 1,
    metadata: { plan_type: plan.link },
  };

  const secret_key = process.env.PAGARME_SECRET_KEY;
  console.log("secret_key", secret_key);
  const authHeader =
    "Basic " + Buffer.from(`${secret_key}:`).toString("base64");

  try {
    // Cria o plano uma única vez
    const response = await fetch("https://api.pagar.me/core/v5/plans", {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(createPlanPagarMe),
    });

    console.log(response.status);
    console.log(response.statusText);

    const data = await response.json();

    if (!response.ok) {
      console.log("Não foi possível criar um plano de assinatura: ", data);
      return NextResponse.json(
        { message: "Erro ao criar plano de assinatura." },
        { status: 401 }
      );
    }

    console.log(data);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Erro ao criar plano Pagar Me:", error);
    return NextResponse.json(
      { message: "Falha ao criar plano de assinatura" },
      { status: 500 }
    );
  }
}
