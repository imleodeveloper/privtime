"use client";
import {
  Ban,
  CheckCircle,
  ChevronDown,
  CircleAlert,
  CircleEllipsis,
  Home,
  TriangleAlert,
  X,
} from "lucide-react";
import { Footer } from "../../../../components/footer";
import { Header } from "../../../../components/header";
import { NavigationProfile } from "../../../../components/profile/navigation-profile";
import Link from "next/link";
import { Button } from "../../../../components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import { formatDate, formatPrice } from "../../../../lib/plans";

export default function Profile() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [detailsPlan, setDetailsPlan] = useState<boolean>(false);
  const [section, setSection] = useState<"pagamentos" | "reembolsos">(
    "pagamentos"
  );

  // useEffect(() => {
  //   handleSession();
  // }, []);

  // const handleSession = async () => {
  //   setIsLoading(true);
  //   try {
  //     const { data: sessionUser } = await supabase.auth.getSession();
  //     const sessionToken = sessionUser.session?.access_token;

  //     const response = await fetch("/api/auth/perfil/pagamentos", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: `Bearer ${sessionToken}`,
  //       },
  //     });

  //     const data = await response.json();

  //     if (!response.ok) {
  //       console.log(response.status);
  //       console.log(response.statusText);
  //       alert("Erro interno no servidor ao buscar dados do usuário");
  //       return;
  //     }

  //     setIsLoading(false);
  //   } catch (error) {
  //     console.error("Não foi possível encontrar sessão ativa", error);
  //     alert(
  //       "Erro no servidor ao procurar sessão do usuário, redirecionando para a tela de login do usuário"
  //     );
  //     setIsLoading(false);
  //     return;
  //   }
  // };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-main-pink mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando seus dados...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  return (
    <>
      <Header />
      <main className="w-full h-screen flex justify-center items-start">
        <NavigationProfile />
        <article className="w-[80%] h-auto flex flex-col justify-start items-start gap-8 pt-12 px-6 relative">
          <div className="flex justify-start items-center gap-3">
            <span className="text-xl font-semibold py-1 pr-4 border-r border-black/20">
              Histórico de Pagamentos
            </span>
            <span className="flex justify-center items-center gap-1">
              <Link
                href="/perfil"
                className="text-gray-500 hover:text-main-purple"
              >
                <Home className="w-5 h-5"></Home>
              </Link>
              <span className="text-gray-500">-</span>
              <span className="text-gray-500 text-sm hover:text-main-purple">
                Histórico de pagamentos
              </span>
            </span>
          </div>
          <div className="flex flex-col justify-center items-start w-full bg-white border border-black/30 rounded-md pt-4 overflow-hidden">
            <div className="flex justify-start items-center border-b border-black/20 w-full">
              <span className="px-4 py-2 border-b-2 border-main-pink text-main-pink font-semibold transition-all duration-300 cursor-pointer hover:bg-gray-200 rounded-sm">
                Histórico de pagamentos
              </span>
              <span
                className="
									relative px-4 py-2 cursor-pointer rounded-sm
									hover:text-main-pink hover:bg-gray-200 transition-all duration-300
									after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-main-pink 
									after:transition-all after:duration-500
									hover:after:w-full
								"
              >
                Histórico de reembolsos
              </span>
            </div>
            <div></div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
