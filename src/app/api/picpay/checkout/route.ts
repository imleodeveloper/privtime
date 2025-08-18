import { NextResponse, NextRequest } from "next/server";

interface CreatePlanPicPay {
  billingCycle: string;
  amount: number;
  totalBillingCycles: number;
  initialGraceCycles: number;
  tag: string;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { plan, profile } = body;

  const billingCycle = plan.type === "Mensal" ? "MONTHLY" : "ANNUAL";
  const amount = plan.type === "Mensal" ? 5819 : 57828;

  const createPlanPicPay: CreatePlanPicPay = {
    billingCycle: billingCycle,
    amount: amount,
    totalBillingCycles: 0,
    initialGraceCycles: 0,
    tag: plan.type,
  };
  console.log(createPlanPicPay);
  console.log(JSON.stringify(createPlanPicPay));
  console.log(process.env.X_PICPAY_TOKEN);
  console.log(process.env.X_SELLER_TOKEN);
  try {
    // Cria o plano
    const response = await fetch(
      "https://checkout-api.picpay.com/api/v1/recurrency/plans",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${process.env.X_PICPAY_TOKEN}`,
          "x-seller-token": `${process.env.X_SELLER_TOKEN}`,
        },
        body: JSON.stringify(createPlanPicPay),
      }
    );

    console.log(response.status);
    console.log(response.statusText);

    const data = await response.json();

    if (!response.ok) {
      console.log("Não foi possível criar um plano de assinatura: ", data);
      return NextResponse.json(
        { message: "Erro ao criar plano de assinatura." },
        { status: 400 }
      );
    }

    console.log(data);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Erro ao criar plano PicPay:", error);
    return NextResponse.json(
      { message: "Falha ao criar plano de assinatura" },
      { status: 500 }
    );
  }
}
