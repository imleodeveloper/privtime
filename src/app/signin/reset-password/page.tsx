"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { useState } from "react";
import { LockKeyholeOpen, TriangleAlert } from "lucide-react";
import { supabase } from "../../../../lib/supabase";

interface FormData {
  email: string;
}

export default function ResetPasswordPage() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!formData.email.trim()) {
      setError("Informe um e-mail válido.");
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log(
          "Não foi possível verificar no servidor o e-mail:",
          response.status
        );
        setError("Erro no servidor ao localizar e-mail, tente novamente.");
        return;
      }

      if (response.status === 400 || response.status === 404) {
        setError(data.message);
        return;
      }

      if (response.status === 200) {
        const { error: sendError } = await supabase.auth.resetPasswordForEmail(
          formData.email,
          {
            redirectTo: `https://privtime.vercel.app/signin/reset-password/reset`,
          }
        );

        if (sendError) {
          console.error(
            "Erro ao enviar e-mail de recuperação:",
            sendError.message
          );
          setError(
            "Erro ao enviar e-mail de recuperação, confirme se seu e-mail está correto."
          );
          return;
        }

        setSuccess(
          "Enviado link para recuperação de senha no e-mail informado, confira na caixa de entrada, spam ou lixeira."
        );
      }
    } catch (err) {
      console.error("Erro ao enviar recuperação de senha: ", err);
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
              className="w-10/12 md:w-2/6 space-y-8 bg-sub-background/40 shadow-xl p-4 rounded-xl"
            >
              <div className="relative w-full h-24 flex justify-center items-center">
                <Link href="/">
                  <Image
                    src="/privetime-users.png"
                    alt=""
                    width={125}
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
                <label htmlFor="email" className="text-sm text-gray-600">
                  E-mail
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="seuemail@dominio.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="text-base py-2"
                  required
                />
              </div>

              <div>
                <Button
                  className="w-full text-white px-6 py-4 text-lg"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? "Enviando..." : "Enviar e-mail de redefinição"}
                </Button>
              </div>
              <div className="text-center">
                <Link href="/signin">
                  <Button className="w-full bg-transparent hover:bg-transparent text-main-pink">
                    Voltar à página de login
                  </Button>
                </Link>
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
