"use client";
import {
  AppWindow,
  Cog,
  Component,
  Copy,
  Group,
  History,
  House,
  ScreenShare,
  Server,
  ShieldUser,
  WalletCards,
} from "lucide-react";
import { Footer } from "../../../components/footer";
import { Header } from "../../../components/header";
import { NavigationProfile } from "../../../components/profile/navigation-profile";
import { Button } from "../../../components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";
import { UserPlan, UserProfile } from "../api/auth/perfil/route";
import { formatDate } from "../../../lib/plans";
import Link from "next/link";

export default function Profile() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [copyLink, setCopyLink] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    full_name: "",
    phone: "",
    email: "",
    identity: "",
    created_at: "",
    updated_at: "",
    link_app: "",
    link_share_app: "",
    slug_link: "",
    birthdate: "",
  });
  const [userPlan, setUserPlan] = useState<UserPlan>({
    price_at_purchase: 0,
    subscription_id: "",
    last_transaction_id: "",
    created_at: "",
    expires_at: "",
    status: "",
    plan_id: "",
    plan_slug: "",
    plan_type: "",
  });

  useEffect(() => {
    handleSession();
  }, []);

  const handleSession = async () => {
    setIsLoading(true);
    try {
      const { data: sessionUser } = await supabase.auth.getSession();
      const sessionToken = sessionUser.session?.access_token;

      const response = await fetch("/api/auth/perfil", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.log(response.status);
        console.log(response.statusText);
        setIsLoading(false);
        setTimeout(
          () => (window.location.href = "/signin?redirect=/perfil"),
          3000
        );
        return;
      }

      setUserPlan(data.planOfUser);
      setUserProfile(data.profile);
      setIsLoading(false);
    } catch (error) {
      console.error("Não foi possível encontrar sessão ativa", error);
      setIsLoading(false);
      setTimeout(
        () => (window.location.href = "/signin?redirect=/perfil"),
        3000
      );
      return;
    }
  };

  let link = "";
  if (userProfile.link_share_app) {
    link = userProfile.link_share_app;
  }

  const copyToLink = () => {
    navigator.clipboard.writeText(link).then(() => {
      setCopyLink(!copyLink);
    });
  };

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
        <article className="w-[80%] h-auto flex flex-col justify-start items-start gap-8 pt-12 px-6">
          <div className="flex flex-col justify-start items-start gap-8">
            <span className="text-3xl font-bold">Olá,</span>
            <span className="text-2xl font-bold">
              Seja bem-vindo {userProfile.full_name}!
            </span>
          </div>
          <div className="flex flex-col justify-center items-start w-full bg-white border border-black/30 rounded-md">
            <div className="w-full p-4 border-b border-black/20 flex justify-start items-center">
              <span className="text-lg font-semibold text-main-pink">
                Seu App de Agendamento
              </span>
            </div>
            <div className="w-full flex justify-between items-center">
              <div className="flex justify-start items-center gap-4 p-4">
                <div className="p-2 bg-main-pink/10 rounded-lg">
                  <span className="relative">
                    <AppWindow className="w-7 h-7 text-main-pink"></AppWindow>
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-white bg-green-600"></div>
                  </span>
                </div>
                <div className="flex flex-col justify-start items-start">
                  <Link
                    href={userProfile.link_app}
                    className="flex justify-center items-center gap-2 font-bold text-main-purple hover:text-main-purple/60"
                  >
                    Acesse seu App{" "}
                    <ScreenShare className="w-5 h-5"></ScreenShare>
                  </Link>
                  <span className="text-sm text-gray-600">
                    Expira em {formatDate(userPlan.expires_at)}
                  </span>
                </div>
              </div>
              <div className="flex justify-start items-center gap-4 p-4">
                <Button
                  className={`text-white text-sm flex justify-center items-center gap-2 relative ${
                    copyLink ? "overflow-none" : "overflow-hidden"
                  }`}
                  onClick={copyToLink}
                >
                  <div
                    className={`
															absolute w-full top-[120%] left-0 p-2 text-center flex justify-center items-center bg-green-600 rounded-md
															before:content-[''] before:absolute before:top-0 before:-1/2 before-translate-x-1/2
															before:-translate-y-full before:border-8 before:border-transparent before:border-b-green-600
															transition-all duration-600 ${
                                copyLink
                                  ? "opacity-100 pointers-events-auto transform translate-y-2"
                                  : "opacity-0 pointers-events-none transform translate-y-0"
                              }
										`}
                  >
                    <span>Link copiado!</span>
                  </div>
                  <Copy className="w-5 h-5"></Copy>Compartilhe seu App
                </Button>
                <button className="bg-main-purple font-bold rounded hover:bg-main-pink transition cursor-pointer text-white">
                  <a
                    href={userProfile.link_app}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm flex justify-center items-center gap-2 px-4 py-2"
                  >
                    <ShieldUser className="w-5 h-5"></ShieldUser>Acessar Admin
                  </a>
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center items-start w-full bg-white border border-black/30 rounded-md">
            <div className="w-full p-4 border-b border-black/20 flex justify-start items-center">
              <span className="text-lg font-semibold text-main-pink">
                Assinatura
              </span>
            </div>
            <div className="w-full flex justify-between items-center">
              <div className="flex justify-start items-center gap-4 p-4">
                <div className="p-2 bg-main-pink/10 rounded-lg">
                  <span className="relative">
                    <Server className="w-7 h-7 text-main-pink"></Server>
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-white bg-green-600"></div>
                  </span>
                </div>
                <div className="flex flex-col justify-start items-start">
                  <span className="font-bold">Plano {userPlan.plan_type}</span>
                  <span className="text-sm text-gray-600">
                    Expira em {formatDate(userPlan.expires_at)}
                  </span>
                </div>
              </div>
              <div className="flex justify-start items-center gap-4 p-4">
                <button className="bg-main-purple font-bold rounded hover:bg-main-pink transition cursor-pointer text-white">
                  <Link
                    href="/perfil/assinaturas"
                    className="flex justify-center items-center gap-2 px-4 py-2"
                  >
                    <Cog className="w-5 h-5"></Cog> Gerenciar
                  </Link>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center items-start w-full bg-white border border-black/30 rounded-md">
            <div className="w-full p-4 border-b border-black/20 flex justify-start items-center">
              <span className="text-lg font-semibold text-main-pink">
                Histórico de Pagamentos
              </span>
            </div>
            <div className="w-full flex justify-between items-center">
              <div className="flex justify-start items-center gap-4 p-4">
                <div className="p-2 bg-main-pink/10 rounded-lg">
                  <span className="relative">
                    <WalletCards className="w-7 h-7 text-main-pink"></WalletCards>
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-white bg-green-600"></div>
                  </span>
                </div>
                <div className="flex flex-col justify-start items-start">
                  <span className="font-bold">Último pagamento</span>
                  <span className="text-sm text-gray-600">
                    Finalizado em {formatDate(userPlan.created_at)}
                  </span>
                </div>
              </div>
              <div className="flex justify-start items-center gap-4 p-4">
                <button className="bg-main-purple font-bold rounded hover:bg-main-pink transition cursor-pointer text-white">
                  <Link
                    href="/perfil/historico-de-pagamentos"
                    className="px-4 py-2 flex justify-center items-center gap-2"
                  >
                    <History className="w-5 h-5"></History>Acessar Histórico
                  </Link>
                </button>
              </div>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
