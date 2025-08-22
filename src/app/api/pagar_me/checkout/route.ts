import { NextResponse, NextRequest } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";

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
    success_url: string;
    failure_url: string;
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
  metadata: {
    slug_link: string;
    plan_link: string;
    user_id: string;
    plan_id_pagarme: string;
    plan_id_db: string;
  };
}

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
  payment_methods: string[];
  minimum_price: number;
  statement_descriptor: string;
  trial_period_days: number;
  metadata: { plan_type: string };
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { plan, profile } = body;

  // console.log(plan);

  // const interval = plan.type === "Mensal" ? "month" : "year";
  let interval: string = "";
  switch (plan.type) {
    case "Mensal":
      interval = "month";
      break;
    case "Anual":
      interval = "year";
      break;
    case "Test":
      interval = "month";
      break;
    default:
      throw new Error("Tipo de plano inválido");
  }

  // const amount = plan.type === "Mensal" ? 5819 : 57828;
  let amount: number = 0;
  switch (plan.type) {
    case "Mensal":
      amount = 5819;
      break;
    case "Anual":
      amount = 57828;
      break;
    case "Test":
      amount = 100;
      break;
    default:
      throw new Error("Tipo de plano inválido");
  }

  // const name = plan.type === "Mensal" ? "Plano Mensal" : "Plano Anual";
  let name: string = "";
  switch (plan.type) {
    case "Mensal":
      name = "Plano Mensal";
      break;
    case "Anual":
      name = "Plano Anual";
      break;
    case "Test":
      name = "Plano Teste";
      break;
    default:
      throw new Error("Tipo de plano inválido");
  }

  let plan_id: string = "";
  switch (plan.type) {
    case "Mensal":
      plan_id = "plan_MQzGwyJFpSQjoA4d";
      break;
    case "Anual":
      plan_id = "plan_DYZjG87hmUw3wN0R";
      break;
    case "Test":
      plan_id = "plan_xXj8xm2S1vUNYegQ"; //"plan_E1j3Q6HZNFzlDn4r";
      break;
    default:
      throw new Error("Tipo de plano inválido");
  }
  //plan.type === "Mensal" ? "plan_MQzGwyJFpSQjoA4d" : "plan_DYZjG87hmUw3wN0R";

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

  const { data, error } = await supabaseAdmin
    .from("users_plan")
    .select("plan_id")
    .eq("user_id", profile.id)
    .single();

  if (error) {
    console.log("Não foi possível encontrar usuário e plano:", error);
    return NextResponse.json(
      { message: "Não foi possível encontrar o usuário e plano" },
      { status: 404 }
    );
  }

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
      success_url: "https://privtime.vercel.app/",
      failure_url: "https://privtime.vercel.app/",
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
    metadata: {
      slug_link: profile.slug_link,
      plan_link: plan.link,
      user_id: profile.id,
      plan_id_pagarme: plan_id,
      plan_id_db: data.plan_id,
    },
  };

  const secret_key = process.env.PAGARME_SECRET_KEY;
  const authHeader =
    "Basic " + Buffer.from(`${secret_key}:`).toString("base64");
  console.log("Objeto sub:", createSubscriptionPagarMe);
  try {
    // Redireciona pro checkout uma única vez
    const response = await fetch("https://api.pagar.me/core/v5/paymentlinks", {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(createSubscriptionPagarMe),
    });

    // console.log(createPlanPagarMe);

    // const response = await fetch("https://api.pagar.me/core/v5/plans", {
    //   method: "POST",
    //   headers: {
    //     Authorization: authHeader,
    //     "Content-Type": "application/json",
    //     Accept: "application/json",
    //   },
    //   body: JSON.stringify(createPlanPagarMe),
    // });

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
