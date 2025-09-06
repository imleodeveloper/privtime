"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyholeOpen, TriangleAlert } from "lucide-react";
import { supabase } from "../../../../../lib/supabase";

interface FormData {
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

  const validateForm = () => {
    if (!formData.password) {
      setError("Senha é obrigatória");
      return false;
    }
    if (formData.password.length < 8) {
      setError("Senha deve ter pelo menos 8 caracteres");
      return false;
    }

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
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: formData.password,
      });

      if (error) {
        console.error("Erro ao atualizar senha:", error);
        setError("Nova senha deve ser diferente da senha antiga.");
        return;
      }

      setSuccess("Senha atualizada com sucesso!");
      setTimeout(() => router.push("/signin"), 5000);
    } catch (err) {
      console.error("Erro na atualização de senha: ", err);
      setError("Erro ao atualizar senha no servidor.");
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
                    src="/privetime-purple-not-bg-minor.webp"
                    alt=""
                    width={200}
                    height={125}
                  />
                </Link>
              </div>
              <div className="flex flex-col justify-start items-center gap-1">
                <span className="text-main-pink font-bold text-3xl text-center">
                  Redefinir senha
                </span>
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
                  className="text-base py-2"
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
                    className="text-base py-2"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
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
                  {isLoading ? "Cadastrando..." : "Cadastrar nova senha"}
                </Button>
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
