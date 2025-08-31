import { NextResponse } from "next/server";
import { supabase } from "../../../../../lib/supabase";
import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";

function generateSlug(name: string) {
  const base = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const random = Math.floor(1000 + Math.random() * 900000); // entre 1000 e 999999

  return `${base}${random}`; // Ex: leonardo-vieira8237
}

export async function POST(request: Request) {
  const body = await request.json();
  const { fullName, phone, email, cpf, password, birthDate } = body;

  // Verificação mais segura - usa trim
  if (
    !fullName.trim() ||
    !phone.trim() ||
    !email.trim() ||
    !cpf.trim() ||
    !password.trim()
  ) {
    return NextResponse.json(
      { message: "Campos não preenchidos são obrigatórios" },
      { status: 400 }
    );
  }

  // Api de admin para checar se o email já existe na auth.users
  const { data: usersExists, error: adminError } =
    await supabaseAdmin.auth.admin.listUsers();

  if (adminError) {
    console.error("Erro ao verificar usuários: ", adminError);
    return NextResponse.json(
      { message: "Erro ao verificar o email" },
      { status: 500 }
    );
  }

  function isAdult(birthday: string): boolean {
    const today = new Date();
    const birth = new Date(birthday);

    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    // Ajusta se o mês/dia atual ainda não chegou
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age >= 18;
  }

  if (!isAdult(birthDate)) {
    return NextResponse.json(
      { message: "Você precisa ter 18 anos ou mais para se cadastrar." },
      { status: 400 }
    );
  }

  const cpfTrim = cpf.trim();
  const cpfClean = cpfTrim.replace(/\D/g, "");
  const hasLettersInCPF = /^[0-9]+$/.test(cpfTrim);
  // CHECK CPF
  if (cpfClean.length !== 11) {
    return NextResponse.json(
      {
        message: "O CPF deve ter exatamente 11 dígitos",
      },
      { status: 400 }
    );
  }

  if (!cpfClean) {
    return NextResponse.json(
      {
        message: "O CPF deve conter apenas números",
      },
      { status: 400 }
    );
  }

  // Api de admin para checar se o CPF já existe na profiles
  const { data: identityExists, error: identityError } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("identity", cpf)
    .single();

  if (identityExists) {
    return NextResponse.json(
      { message: "O CPF informado já está cadastrado" },
      { status: 400 }
    );
  }

  // Check Email
  const emailExists = usersExists.users.some((user) => user.email === email);
  if (emailExists) {
    return NextResponse.json(
      { message: "O email informado já está cadastrado" },
      { status: 400 }
    );
  }

  // Check password
  if (password.length < 8) {
    return NextResponse.json(
      { message: "A senha deve conter no mínimo 8 caracteres." },
      { status: 400 }
    );
  }

  /*const strongPassword =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!strongPassword.test(password)) {
    return NextResponse.json(
      {
        message:
          "A senha deve ser forte com pelo menos um caractere especial, uma letra maiúscula e um número",
      },
      { status: 400 }
    );
  } */
  try {
    // Tenta cadastrar no auth
    const { data: dataSignUp, error: signUpError } = await supabase.auth.signUp(
      {
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
            identity: cpf,
          },
        },
      }
    );

    if (signUpError) {
      return NextResponse.json(
        {
          message:
            signUpError.message || "Não foi possível cadastrar o usuário",
        },
        { status: 400 }
      );
    }

    // Verifica se o perfil já existe antes de inserir
    const { data: existingProfile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("id", dataSignUp.user?.id)
      .single();

    async function generateUniqueSlug(name: string): Promise<string> {
      let slug = generateSlug(name);
      let exists = true;
      while (exists) {
        const { data } = await supabaseAdmin
          .from("profiles")
          .select("slug_link")
          .eq("slug_link", slug)
          .single();

        if (!data) {
          exists = false;
        } else {
          slug = generateSlug(name);
        }
      }
      return slug;
    }

    // SLUG LINK DO USUÁRIO BASEADO NO NOME EX: usuario-full12456
    const slug_link = await generateUniqueSlug(fullName);
    // LINK DO APP BASEADO NO SLUG_LINK
    const link_app = `${process.env.SHARE_LINK_APP_VIAMODELS}/${slug_link}/admin`;
    const link_share_app = `${process.env.SHARE_LINK_APP_VIAMODELS}/${slug_link}`;
    // Se não existir cria o perfil na tabela profiles
    if (!existingProfile) {
      //Gerar slug_link único

      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .insert([
          {
            id: dataSignUp.user?.id,
            full_name: fullName,
            phone: phone,
            email: email,
            identity: cpf,
            link_app: link_app,
            link_share_app: link_share_app,
            slug_link: slug_link,
            birthdate: birthDate,
          },
        ]);

      if (profileError) {
        console.error("Erro ao criar o perfil: ", profileError);
      }
    } else if (existingProfile) {
      return NextResponse.json(
        {
          message:
            "Não foi possível criar o perfil, o usuário já existe na tabela.",
        },
        { status: 500 }
      );
    }

    const { data: existingAdmin } = await supabase
      .from("admins")
      .select("*")
      .eq("slug_link", slug_link)
      .single();

    if (!existingAdmin) {
      const { error: adminError } = await supabaseAdmin.from("admins").insert([
        {
          email: email,
          slug_link: slug_link,
          name: fullName,
          role: "super_admin",
        },
      ]);

      if (adminError) {
        console.error("Erro ao criar o perfil admin: ", adminError);
      }
    } else if (existingAdmin) {
      return NextResponse.json(
        {
          message:
            "Não foi possível criar o perfil administrador, o usuário já existe na tabela.",
        },
        { status: 500 }
      );
    }

    const { data: trialPlan, error: errorTrialPlan } = await supabase
      .from("plans")
      .select("*")
      .eq("slug", "trial_plan")
      .single();

    if (errorTrialPlan) {
      console.log("Erro ao procurar Trial Plan: ", errorTrialPlan);
      return NextResponse.json(
        { message: "Erro ao localizar plano de 7 dias." },
        { status: 500 }
      );
    }

    const { data: existingTrialPlan, error: errorExistingPlan } = await supabase
      .from("users_plan")
      .select("*")
      .eq("user_id", dataSignUp.user?.id)
      .limit(1)
      .maybeSingle();

    if (errorExistingPlan) {
      console.log(
        "Erro ao consultar se usuário tem plano: ",
        errorExistingPlan
      );
      return NextResponse.json(
        { message: "Erro ao consultar se usuário possuí plano." },
        { status: 500 }
      );
    }

    if (!existingTrialPlan) {
      const createdAt = new Date();
      const { error: errorPlan } = await supabaseAdmin
        .from("users_plan")
        .insert([
          {
            user_id: dataSignUp.user?.id,
            plan_id: trialPlan?.id,
            slug_plan_at_moment: trialPlan?.slug,
            price_at_purchase: trialPlan?.price,
            subscription_id: "free",
            last_transaction_id: "none",
            created_at: createdAt,
            status: "active",
            payment_method: "none",
          },
        ]);

      if (errorPlan) {
        console.log("Erro ao inserir o plano gratuito por 7 dias: ", errorPlan);
        return NextResponse.json(
          { message: "Erro ao inserir plano ao usuário." },
          { status: 500 }
        );
      }
    } else if (existingTrialPlan) {
      console.log("Usuário já possuí plano cadastrado.");
      return NextResponse.json(
        { message: "Usuário já possuí plano cadastrado" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Usuário registrado com sucesso" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Erro interno: ", err);
    if (err instanceof Error) {
      return NextResponse.json(
        { message: "Erro interno do servidor" },
        { status: 500 }
      );
    }
  }
}
