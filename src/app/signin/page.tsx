"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { useEffect, useState } from "react";
import { Eye, EyeOff, LockKeyholeOpen, TriangleAlert } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

interface FormData {
  email: string;
  password: string;
}

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/perfil";
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
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

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.push(redirectTo);
      }
    };
    checkAuth();
  }, [router, redirectTo]);

  const validateForm = () => {
    return 4;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const { user, session } = await response.json();

      if (user === null || session === null || !response.ok) {
        setError("Conta não existente ou as credênciais estão incorretas.");
        return;
      }

      if (user || session) {
        setSuccess("Login realizado com sucesso!");
      }

      //  Salva a sessão no cliente
      await supabase.auth.setSession({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });

      setTimeout(() => {
        router.push(redirectTo);
      }, 1500);
    } catch (err) {
      console.error("Erro no login: ", err);
      setError("Erro interno. Tente novamente.");
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
              className="w-10/12 lg:w-2/6 space-y-4 bg-sub-background/40 shadow-xl p-4 rounded-xl"
            >
              <div className="relative w-full h-24 flex justify-center items-center">
                <Link href="/">
                  <Image
                    src="/privetime-purple-not-bg-minor.webp"
                    alt=""
                    width={200}
                    height={125}
                  />
                </Link>
              </div>
              <div className="flex flex-col justify-start items-start gap-1">
                <span className="text-main-pink font-bold text-2xl">
                  Acesse sua conta
                </span>
                <span className="text-gray-800 text-sm">
                  Faça login ou se cadastre para começar
                </span>
              </div>
              <div className="w-full flex flex-col justify-center items-start gap-2">
                <label htmlFor="email" className="text-sm text-gray-600">
                  E-mail
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seuemail@dominio.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="text-sm"
                  required
                />
              </div>
              <div className="w-full flex flex-col justify-center items-start gap-2">
                <label htmlFor="email" className="text-sm text-gray-600">
                  Senha
                </label>
                <div className="relative w-full">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className="text-sm"
                    required
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
                <Link
                  href="/signin/reset-password"
                  className="w-full text-blue-500 underline font-bold hover:text-blue-800"
                >
                  Esqueceu a senha?
                </Link>
              </div>
              <div>
                <Button
                  className="w-full text-white"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Entrando..." : "Entrar"}
                </Button>
              </div>
              <div className="text-center">
                <Link href="/signup">
                  <Button className="w-full bg-sub-purple hover:text-white">
                    Criar uma conta
                  </Button>
                </Link>
                <span className="w-full text-center text-sm text-gray-600">
                  Teste gratis por 7 dias
                </span>
              </div>
              <div className="text-center">
                <span className="text-sm">
                  Ao entrar, você concorda com nossos{" "}
                  <Link
                    href="/termos-de-uso"
                    className="text-blue-500 hover:text-blue-800 underline"
                  >
                    Termos de uso
                  </Link>{" "}
                  e{" "}
                  <Link
                    href="/politica-de-privacidade"
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
                <span>
                  Você será redirecionado em 5 segundos para a área do cliente.
                </span>
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
