import { NextResponse, NextRequest } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";

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
  birthdate: string;
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
  };
}
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { infoForPayment, selectedPlan, fetchProfile } = body;
  // console.log("INFOFORPAYMENT: ", infoForPayment);
  // console.log("SELECTEDPLAN: ", selectedPlan);
  // console.log("FETCHPROFILE: ", fetchProfile);

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
    birthdate: fetchProfile.birthdate,
    name: infoForPayment.full_name,
    email: infoForPayment.email,
    code: fetchProfile.slug_link,
    document: cleanIdentity,
    document_type: infoForPayment.typeDoc,
    type: "individual",
    metadata: {
      slug_link: fetchProfile.slug_link,
      user_id: fetchProfile.id,
      user_plan: selectedPlan.link,
    },
  };

  let plan_id: string = "";
  switch (selectedPlan.type) {
    case "Mensal":
      plan_id = "plan_MQzGwyJFpSQjoA4d";
      break;
    case "Anual":
      plan_id = "plan_DYZjG87hmUw3wN0R";
      break;
    case "Test":
      plan_id = "plan_qEX0JmzTvTNQB1o7"; //"plan_KQ6A3nWsVUKyoeEX"; //"plan_xXj8xm2S1vUNYegQ"; //"plan_E1j3Q6HZNFzlDn4r";
      break;
    default:
      throw new Error("Tipo de plano inválido");
  }
  try {
    const secret_key = process.env.PAGARME_SECRET_KEY;
    const authHeader =
      "Basic " + Buffer.from(`${secret_key}:`).toString("base64");
    console.log("Objeto CreateCustomer: ", createCustomerPagarMe);

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

    console.log("Customer criado:", dataCreateCustomer);

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
      },
    };

    console.log("Objeto Create Subscription: ", createSubscriptionPagarMe);

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
        message_ok: "Assinatura criada com sucesso!",
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
