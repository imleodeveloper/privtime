import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../../lib/supabaseAdmin";

interface CreateCustomerPagarMe {
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
    plan_id_dbs: string;
  };
}

interface CreateObjectPix {
  customer_id: string;
  items: [
    {
      amount: number;
      description: string;
      quantity: number;
      code: string;
    }
  ];
  payments: [
    {
      payment_method: string;
      Pix: {
        expires_in: number;
      };
      amount: number;
    }
  ];
  antifraud_enabled: boolean;
  closed: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { infoForPayment, selectedPlan, fetchProfile } = body;

    const individualOrCompany = infoForPayment.typeDoc;
    let indivOrCompany = "";
    if (individualOrCompany === "cpf") {
      indivOrCompany = "individual";
    } else if (individualOrCompany === "cnpj") {
      indivOrCompany = "company";
    }

    // CLEAN INFOS
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

    const { data: idPlan, error: errorIdPlan } = await supabaseAdmin
      .from("plans")
      .select("id")
      .eq("slug", selectedPlan.link)
      .single();

    const createCustomer: CreateCustomerPagarMe = {
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
      type: indivOrCompany,
      metadata: {
        slug_link: fetchProfile.slug_link,
        user_id: fetchProfile.id,
        user_plan: selectedPlan.link,
        plan_id_dbs: idPlan?.id,
      },
    };

    const responseCreateCustomer = await fetch(
      "https://api.pagar.me/core/v5/customers",
      {
        method: "POST",
        headers: {
          Authorization: authHeader,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createCustomer),
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

    const createPix: CreateObjectPix = {
      payments: [
        {
          payment_method: "pix",
          Pix: {
            expires_in: 3600,
          },
          amount: amount,
        },
      ],
      customer_id: dataCreateCustomer.id,
      items: [
        {
          amount: amount,
          description: name,
          quantity: 1,
          code: selectedPlan.link,
        },
      ],
      antifraud_enabled: true,
      closed: true,
    };

    const responseCreatePix = await fetch(
      "https://api.pagar.me/core/v5/orders",
      {
        method: "POST",
        headers: {
          Authorization: authHeader,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createPix),
      }
    );

    if (!responseCreatePix.ok) {
      console.error("Erro ao consultar servidor de PIX do Pagar-Me");
      return NextResponse.json(
        { message: "Erro ao consultar servidor de PIX do Pagar-Me" },
        { status: 400 }
      );
    }

    const dataPix = await responseCreatePix.json();

    const pixLastTransaction = dataPix.charges[0].last_transaction;

    return NextResponse.json(
      { pix_transaction: pixLastTransaction },
      { status: 200 }
    );
  } catch (error) {
    console.error("Não foi possível realizar o pedido via PIX:", error);
    return NextResponse.json(
      { message: "Erro no servidor ao realizar pedido via PIX" },
      { status: 500 }
    );
  }
}
