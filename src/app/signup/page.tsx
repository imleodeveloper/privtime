"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyholeOpen, TriangleAlert } from "lucide-react";

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  cpf: string;
  password: string;
  confirmPassword: string;
}

export default function SignUp() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    phone: "",
    email: "",
    cpf: "",
    password: "",
    confirmPassword: "",
  });

  function handleInputChange<K extends keyof FormData>(
    key: K,
    value: FormData[K]
  ) {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
    // Limpar erro quando usuário começar a digitar
    if (error) setError("");
  }

  const strongPassword =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError("Nome completo é obrigatório");
      return false;
    }

    if (formData.fullName.length < 6) {
      setError("Informe nome completo e com sobrenome");
      return false;
    }

    if (!formData.email.trim()) {
      setError("Email é obrigatório");
      return false;
    }

    if (!formData.cpf.trim()) {
      setError("CPF é obrigatórios");
      return false;
    }

    if (!formData.password) {
      setError("Senha é obrigatória");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Senha deve ter pelo menos 8 caracteres");
      return false;
    }

    /*if (!strongPassword.test(formData.password)) {
      setError(
        "A senha deve ser forte com pelo menos um caractere especial, letra maiuscula e número"
      );
      return false;
    } */

    if (formData.password !== formData.confirmPassword) {
      setError("Senhas não coincidem");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      console.log("Retorno API SIGNUP: ", data);

      if (!response.ok) {
        throw new Error(
          data.message || "Erro interno do servidor ao registrar."
        );
      }

      setSuccess("Cadastro realizado com sucesso! Verifique seu email.");

      setTimeout(() => router.push("/signin"), 5000);
    } catch (err) {
      console.error("Erro no cadastro: ", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro ao realizar o cadastro");
      }
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="w-full">
      <main className="w-full mx-auto">
        <article className="w-full container mx-auto relative">
          <section className="flex justify-center items-center py-24">
            <form
              onSubmit={handleSubmit}
              className="w-10/12 md:w-2/6 space-y-4 bg-sub-background/40 shadow-xl p-4 rounded-xl"
            >
              <div className="relative w-full h-24 flex justify-center items-center">
                <Link href="/">
                  <Image
                    src="/privtime-fullpink.png"
                    alt=""
                    width={125}
                    height={125}
                  />
                </Link>
              </div>
              <div>
                <span className="text-gray-800 text-sm font-bold">
                  Olá! Use suas informações para cadastrar no site
                </span>
              </div>
              <div className="w-full flex flex-col justify-center items-start gap-2">
                <label htmlFor="name" className="text-sm text-gray-600">
                  Nome Completo
                </label>
                <Input
                  id="name"
                  name="fullName"
                  type="text"
                  placeholder="Seu nome completo"
                  value={formData.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
                  className="text-sm"
                  required
                />
              </div>
              <div className="w-full flex flex-col justify-center items-start gap-2">
                <label htmlFor="phone" className="text-sm text-gray-600">
                  Celular
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="(11) 91234-5678"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  required
                  className="text-sm"
                />
              </div>
              <div className="w-full flex flex-col justify-center items-start gap-2">
                <label htmlFor="email" className="text-sm text-gray-600">
                  E-mail
                </label>
                <Input
                  id="email"
                  name="email"
                  type="text"
                  placeholder="seuemail@dominio.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  required
                  className="text-sm"
                />
              </div>
              <div className="w-full flex flex-col justify-center items-start gap-2">
                <label htmlFor="CPF" className="text-sm text-gray-600">
                  CPF
                </label>
                <Input
                  id="CPF"
                  name="CPF"
                  type="text"
                  placeholder="000.000.000-00"
                  maxLength={11}
                  value={formData.cpf}
                  onChange={(e) => handleInputChange("cpf", e.target.value)}
                  required
                  className="text-sm"
                />
              </div>
              <div className="w-full flex flex-col justify-center items-start gap-2">
                <label htmlFor="password" className="text-sm text-gray-600">
                  Senha
                </label>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha forte"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  required
                  className="text-sm"
                />
              </div>
              <div className="w-full flex flex-col justify-center items-start gap-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm text-gray-600"
                >
                  Confirmar Senha
                </label>
                <div className="w-full relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirme sua senha"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    required
                    className="text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <Button
                  className="w-full text-white"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Cadastrando..." : "Cadastrar"}
                </Button>
              </div>
              <div className="text-center">
                <Link href="/signin">
                  <Button className="w-full bg-sub-purple">
                    Já tenho uma conta
                  </Button>
                </Link>
                <span className="w-full text-center text-sm text-gray-600">
                  Teste gratis por 7 dias
                </span>
              </div>
              <div className="text-center">
                <span className="text-sm">
                  Ao cadastrar, você concorda com nossos{" "}
                  <Link
                    href=""
                    className="text-blue-500 hover:text-blue-800 underline"
                  >
                    Termos de uso
                  </Link>{" "}
                  e{" "}
                  <Link
                    href=""
                    className="text-blue-500 hover:text-blue-800 underline"
                  >
                    Política de privacidade
                  </Link>
                </span>
              </div>
            </form>
          </section>
          {error && (
            <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center backdrop-blur">
              <div className="mx-auto border-red-200 flex flex-col justify-center items-center gap-4 bg-red-50 text-red-800 p-8 text-center font-bold rounded-lg">
                <TriangleAlert className="w-6 h-6"></TriangleAlert> {error}
                <Button className="text-white" onClick={() => setError("")}>
                  Ok
                </Button>
              </div>
            </div>
          )}
          {success && (
            <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center backdrop-blur">
              <div className="mx-auto border-green-200 flex flex-col justify-center items-center gap-4 bg-green-50 text-green-800 p-8 text-center font-bold rounded-lg">
                <LockKeyholeOpen className="w-6 h-6"></LockKeyholeOpen>{" "}
                {success}
                <span>Você será redirecionado em 5 segundos para o login.</span>
                <Button className="text-white" onClick={() => setSuccess("")}>
                  Ok
                </Button>
              </div>
            </div>
          )}
        </article>
      </main>
    </div>
  );
}
