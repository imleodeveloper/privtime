import { NextResponse, NextRequest } from "next/server";
import { supabaseAdmin } from "../../../../../../lib/supabaseAdmin";

interface CreateCustomerPagarMe {
  address: {
    country: string;
    state: string;
    city: string;
    zip_code: string;
    line_1: string;
    line_2: string;
  };
  phones: {
    mobile_phone: {
      country_code: string;
      area_code: string;
      number: number;
    };
  };
  // birthdate: string;
  name: string;
  email: string;
  code: string;
  document: string;
  document_type: string;
  type: string;
  metadata: {
    slug_link: string;
    user_id: string;
    user_plan: string;
    plan_id_dbs: string;
  };
}

interface CreateSubscriptionPagarMe {
  card: {
    number: string;
    holder_name: string;
    holder_document: string;
    exp_month: string;
    exp_year: string;
    cvv: string;
    billing_address_id: string;
  };
  installments: number;
  customer_id: string;
  code?: string;
  plan_id: string;
  payment_method: string;
  metadata: {
    slug_link: string;
    user_id: string;
    user_plan: string;
    plan_id_dbs: string;
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
  metadata: { plan_type: string };
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { infoForPayment, selectedPlan, fetchProfile } = body;
  // console.log("INFOFORPAYMENT: ", infoForPayment);
  // console.log("SELECTEDPLAN: ", selectedPlan);
  // console.log("FETCHPROFILE: ", fetchProfile);

  const individualOrCompany = infoForPayment.typeDoc;
  let indivOrCompany = "";
  if (individualOrCompany === "cpf") {
    indivOrCompany = "individual";
  } else if (individualOrCompany === "cnpj") {
    indivOrCompany = "company";
  }

  // CLEAN CEP
  const zipCode = infoForPayment.cep;
  const cleanCEP = zipCode.replace(/\D/g, ""); // Só número

  // CLEAN PHONE
  const mobilePhone = infoForPayment.phone;
  const cleanMobile = mobilePhone.replace(/\D/g, ""); // Só número
  const areaMobilePhone = cleanMobile.slice(0, 2);
  const notAreaMobilePhone = cleanMobile.slice(2);

  // CLEAN CPF OU CNPJ
  const identity = infoForPayment.identity;
  const cleanIdentity = identity.replace(/\D/g, "");

  // Auth
  const secret_key = process.env.PAGARME_SECRET_KEY;
  const authHeader =
    "Basic " + Buffer.from(`${secret_key}:`).toString("base64");

  // const interval = plan.type === "Mensal" ? "month" : "year";
  let interval: string = "";
  switch (selectedPlan.type) {
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
  switch (selectedPlan.type) {
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
  switch (selectedPlan.type) {
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

  const { data: idPlan, error: errorIdPlan } = await supabaseAdmin
    .from("plans")
    .select("id")
    .eq("slug", selectedPlan.link)
    .single();

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
    metadata: { plan_type: selectedPlan.link },
  };

  const createCustomerPagarMe: CreateCustomerPagarMe = {
    address: {
      country: "BR",
      state: infoForPayment.state,
      city: infoForPayment.city,
      zip_code: cleanCEP,
      line_1: infoForPayment.address,
      line_2: infoForPayment.complement,
    },
    phones: {
      mobile_phone: {
        country_code: "55",
        area_code: areaMobilePhone,
        number: notAreaMobilePhone,
      },
    },
    // birthdate: fetchProfile.birthdate,
    name: infoForPayment.full_name,
    email: infoForPayment.email,
    code: fetchProfile.slug_link,
    document: cleanIdentity,
    document_type: infoForPayment.typeDoc,
    type: indivOrCompany,
    metadata: {
      slug_link: fetchProfile.slug_link,
      user_id: fetchProfile.id,
      user_plan: selectedPlan.link,
      plan_id_dbs: idPlan?.id,
    },
  };

  let plan_id: string = "";
  switch (selectedPlan.type) {
    case "Mensal":
      plan_id = "plan_l17dMJKFgFxjeQOz"; // ESSE É PARA PRODUÇÃO "plan_XmjB1bJivTj4GnOx";
      break;
    case "Anual":
      plan_id = "plan_7JEn0rnVSbHN0GxB"; // ESSE É PARA PRODUÇÃO "plan_B1z0OXEHmS1BZWJe";
      break;
    case "Test":
      plan_id = "plan_J8R6WNJs8s3WAMNr"; // ESSE É PARA PRODUÇÃO "plan_1Y02XvBt2tYXgM4z";
      break;
    default:
      throw new Error("Tipo de plano inválido");
  }
  try {
    // API PARA DELETAR PLANO
    // const responseDeletePlan = await fetch(
    //   "https://sdx-api.pagar.me/core/v5/plans/plan_e8gljV4TZZhdzlA0",
    //   {
    //     method: "DELETE",
    //     headers: {
    //       Authorization: authHeader,
    //       Accept: "application/json",
    //     },
    //   }
    // );
    // const dataDeletePlan = await responseDeletePlan.json();
    // console.log("Delete: ", dataDeletePlan);

    // API PARA CRIAR PLANO
    // const responseCreatePlan = await fetch(
    //   "https://api.pagar.me/core/v5/plans",
    //   {
    //     method: "POST",
    //     headers: {
    //       Authorization: authHeader,
    //       "Content-Type": "application/json",
    //       Accept: "application/json",
    //     },
    //     body: JSON.stringify(createPlanPagarMe),
    //   }
    // );

    // console.log(responseCreatePlan.status);
    // console.log(responseCreatePlan.statusText);

    // const dataCreatePlan = await responseCreatePlan.json();
    // console.log("Create: ", dataCreatePlan);

    // console.log("Objeto CreateCustomer: ", createCustomerPagarMe);

    const responseCreateCustomer = await fetch(
      "https://api.pagar.me/core/v5/customers",
      {
        method: "POST",
        headers: {
          Authorization: authHeader,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createCustomerPagarMe),
      }
    );

    if (!responseCreateCustomer.ok) {
      console.log(responseCreateCustomer.status);
      console.log(responseCreateCustomer.statusText);
      return NextResponse.json(
        {
          message:
            "Não foi possível continuar. Verifique suas informações de e-mail, telefone, endereço e tente novamente.",
        },
        { status: 400 }
      );
    }

    const dataCreateCustomer = await responseCreateCustomer.json();

    // console.log("Customer criado:", dataCreateCustomer);

    // Clean info for create-subscription-pagarme
    const cardNumber = infoForPayment.cardNumber;
    const cleanCardNumber = cardNumber.replace(/\D/g, "");

    const cardExpiry = infoForPayment.expiry;
    const cleanCardExpiry = cardExpiry.replace(/\D/g, "");
    const monthExpiry = cleanCardExpiry.slice(0, 2);
    const yearExpiry = cleanCardExpiry.slice(2);

    const createSubscriptionPagarMe: CreateSubscriptionPagarMe = {
      card: {
        number: cleanCardNumber,
        holder_name: infoForPayment.full_name,
        holder_document: cleanIdentity,
        exp_month: monthExpiry,
        exp_year: yearExpiry,
        cvv: infoForPayment.cvv,
        billing_address_id: dataCreateCustomer.address.id,
      },
      installments: 1, // COLOCAR NO FRONT-END PRO USUARIO SELECIONAR ESSA PARTE
      customer_id: dataCreateCustomer.id,
      plan_id: plan_id,
      payment_method: "credit_card",
      metadata: {
        slug_link: fetchProfile.slug_link,
        user_id: fetchProfile.id,
        user_plan: selectedPlan.link,
        plan_id_dbs: idPlan?.id,
      },
    };

    // console.log("Objeto Create Subscription: ", createSubscriptionPagarMe);

    const responseCreateSubscription = await fetch(
      "https://api.pagar.me/core/v5/subscriptions",
      {
        method: "POST",
        headers: {
          Authorization: authHeader,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createSubscriptionPagarMe),
      }
    );
    if (!responseCreateSubscription.ok) {
      console.log(responseCreateSubscription.status);
      console.log(responseCreateSubscription.statusText);
      return NextResponse.json(
        {
          message:
            "Não foi possível processar o pagamento. Verifique os dados do cartão (número, nome do titular e código de segurança) e tente novamente.",
        },
        { status: 400 }
      );
    }
    const dataCreateSubscription = await responseCreateSubscription.json();

    console.log("Subscription criada:", dataCreateSubscription);

    const { error: errorUpdateStatus } = await supabaseAdmin
      .from("users_plan")
      .update({ status: "pending" })
      .eq("user_id", fetchProfile.id)
      .single();

    if (errorUpdateStatus) {
      console.log(
        `Problemas ao atualizar status de plano do usuário: ${fetchProfile.id}: `,
        errorUpdateStatus
      );
      console.log("Porém, assinatura criada.");
    }

    return NextResponse.json(
      {
        message_ok: "Assinatura criada com sucesso! Aguardando pagamento",
        subscription: dataCreateSubscription,
        customer: dataCreateCustomer,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao criar plano Pagar Me:", error);
    return NextResponse.json(
      { message: "Falha ao criar plano de assinatura" },
      { status: 500 }
    );
  }
}
