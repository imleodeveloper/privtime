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
  const { fullName, phone, email, cpf, password } = body;

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

  const cpfTrim = cpf.trim();
  const hasLettersInCPF = /^[0-9]+$/.test(cpfTrim);
  // CHECK CPF
  if (cpf.trim().length !== 11) {
    return NextResponse.json(
      {
        message: "O CPF deve ter exatamente 11 dígitos",
      },
      { status: 400 }
    );
  }

  if (!hasLettersInCPF) {
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

  console.log(identityError, " / ", identityExists);

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

    // Se não existir cria o perfil na tabela profiles
    if (!existingProfile) {
      //Gerar slug_link único

      const slug_link = await generateUniqueSlug(fullName);

      const { error: profileError } = await supabaseAdmin
        .from("profiles")
        .insert([
          {
            id: dataSignUp.user?.id,
            full_name: fullName,
            phone: phone,
            email: email,
            identity: cpf,
            slug_link: slug_link,
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
