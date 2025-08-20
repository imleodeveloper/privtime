import { NextResponse, NextRequest } from "next/server";

interface CreateSubscriptionPagarMe {
  is_building: boolean;
  payment_settings: {
    credit_card_settings: {
      operation_type: string;
    };
    pix_settings: {
      expires_in: number;
    };
    accepted_payment_methods: string[];
    statement_descriptor: string;
  };
  cart_settings: {
    recurrences: [
      {
        plan_id: string;
        start_in: number;
      }
    ];
  };
  layout_settings: {
    image_url: string;
    primary_color: string;
    secondary_color: string;
  };
  name: string;
  type: string;
  external_reference: string;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { plan, profile } = body;

  console.log(profile);
  console.log(plan);

  const interval = plan.type === "Mensal" ? "month" : "year";
  const amount = plan.type === "Mensal" ? 5819 : 57828;
  const name = plan.type === "Mensal" ? "Plano Mensal" : "Plano Anual";
  const plan_id =
    plan.type === "Mensal" ? "plan_MQzGwyJFpSQjoA4d" : "plan_DYZjG87hmUw3wN0R";

  /*const createPlanPagarMe = {
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
  }; */

  const createSubscriptionPagarMe: CreateSubscriptionPagarMe = {
    is_building: false,
    payment_settings: {
      credit_card_settings: {
        operation_type: "auth_and_capture",
      },
      pix_settings: {
        expires_in: 1,
      },
      accepted_payment_methods: ["credit_card"],
      statement_descriptor: "APPVIAMODELS",
    },
    /* customer_settings: {
      customer: {
        phones: {
          mobile_phone: {
            country_code: "55", // PEGAR COUNTRY CODE
            area_code: profile.phone.substring(0, 2), // PEGAR AREA CODE
            number: profile.phone.slice(2), // REMOVER AREA CODE
          },
        },
        name: profile.full_name,
        type: "individual",
        email: profile.email,
        code: profile.id,
        document: profile.identity,
        document_type: "CPF",
        birthdate: profile.birthdate,
      },
      customer_id: profile.id,
    }, */
    cart_settings: {
      recurrences: [
        {
          plan_id: plan_id,
          start_in: 1,
        },
      ],
    },
    layout_settings: {
      image_url:
        "https://privtime.vercel.app/_next/image?url=%2Fprivetime-users-bg.png&w=1920&q=75",
      primary_color: "#faf2fa",
      secondary_color: "#dfc1df",
    },
    name: name,
    type: "subscription",
    external_reference: `${profile.slug_link}_${plan.link}_${profile.id}_plan-id=${plan_id}`,
  };

  const secret_key = process.env.PAGARME_SECRET_KEY;
  const authHeader =
    "Basic " + Buffer.from(`${secret_key}:`).toString("base64");

  try {
    // Cria o plano uma única vez
    const response = await fetch("https://api.pagar.me/core/v5/paymentlinks", {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(createSubscriptionPagarMe),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log("Não foi possível criar um plano de assinatura: ", data);
      return NextResponse.json(
        { message: "Erro ao criar plano de assinatura." },
        { status: 401 }
      );
    }

    console.log(data);

    return NextResponse.json({ url: data.url }, { status: 200 });
  } catch (error) {
    console.error("Erro ao criar plano Pagar Me:", error);
    return NextResponse.json(
      { message: "Falha ao criar plano de assinatura" },
      { status: 500 }
    );
  }
}
