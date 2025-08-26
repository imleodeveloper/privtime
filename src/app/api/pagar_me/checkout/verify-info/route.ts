import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const formatEmail = (value: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  };
  try {
    const body = await request.json();

    if (!body.email || !body.full_name || !body.phone || !body.identity) {
      return NextResponse.json(
        { message: "É necessário preencher todos os campos corretamente." },
        { status: 400 }
      );
    }

    const userName = body.full_name;
    const userPhone = body.phone;
    const userEmail = body.email;
    const userIdentity = body.identity;
    const userDocType = body.typeDoc;

    const validateFullName = (fullName: string) => {
      const parts = fullName.trim().split(/\s+/);
      if (parts.length < 2) {
        return "É necessário informar seu nome completo (nome e sobrenome).";
      }

      // garante que cada parte tem pelo menos 2 letras
      if (parts.some((p) => p.length < 2)) {
        return "Informe um nome válido.";
      }

      return null;
    };

    const errorMsg = validateFullName(userName);
    if (errorMsg) {
      return NextResponse.json({ message: errorMsg }, { status: 400 });
    }

    // Remove tudo que não for numérico
    const lengthPhone = userPhone.replace(/\D/g, "");
    if (lengthPhone.length < 11) {
      return NextResponse.json(
        {
          message:
            "É necessário informar o telefone completo com 11 caracteres.",
        },
        { status: 400 }
      );
    }

    // Verifica se o e-mail, é um e-mail válido
    if (!formatEmail(userEmail)) {
      return NextResponse.json(
        { message: "E-mail inválido." },
        { status: 400 }
      );
    }

    const identityDigits = userIdentity.replace(/\D/g, ""); // só números
    if (!userDocType) {
      return NextResponse.json(
        { message: "É necessário informar o tipo de documento (CPF ou CNPJ)." },
        { status: 400 }
      );
    }

    if (userDocType === "cpf") {
      if (identityDigits.length !== 11) {
        return NextResponse.json(
          { message: "É necessário informar o CPF completo com 11 dígitos." },
          { status: 400 }
        );
      }
    }

    if (userDocType === "cnpj") {
      if (identityDigits.length !== 14) {
        return NextResponse.json(
          { message: "É necessário informar o CNPJ completo com 14 dígitos." },
          { status: 400 }
        );
      }
    }
    return NextResponse.json({ showPayments: true }, { status: 200 });
  } catch (error) {
    console.error("Erro interno no servidor:", error);
    return NextResponse.json(
      { message: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}
