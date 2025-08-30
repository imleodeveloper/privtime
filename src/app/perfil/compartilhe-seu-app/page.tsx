"use client";
import {
  BrickWall,
  Cog,
  Copy,
  ExternalLink,
  Home,
  IdCard,
  LinkIcon,
  ShieldUser,
  Trash,
  TriangleAlert,
  UserCog,
  UserX,
} from "lucide-react";
import { Footer } from "../../../../components/footer";
import { Header } from "../../../../components/header";
import { NavigationProfile } from "../../../../components/profile/navigation-profile";
import Link from "next/link";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import { UserPlan, UserProfile } from "@/app/api/auth/perfil/route";
import { formatDate, formatPrice } from "../../../../lib/plans";

export default function CompartilheSeuApp() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copyLink, setCopyLink] = useState<boolean>(false);
  const [detailsPlan, setDetailsPlan] = useState<boolean>(false);
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
        setTimeout(
          () => (window.location.href = "/signin?redirect=/perfil"),
          200
        );
        return;
      }

      setUserPlan(data.planOfUser);
      setUserProfile(data.profile);
      setIsLoading(false);
    } catch (error) {
      console.error("Não foi possível encontrar sessão ativa", error);
      alert(
        "Erro no servidor ao procurar sessão do usuário, redirecionando para a tela de login do usuário"
      );
      setIsLoading(false);
      return;
    }
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

  const copyToLink = () => {
    navigator.clipboard.writeText(userProfile.link_share_app).then(() => {
      setCopyLink(!copyLink);
    });
    setTimeout(() => setCopyLink(false), 3000);
  };

  return (
    <>
      <Header />
      <main className="w-full h-auto flex justify-center items-start pb-20">
        <NavigationProfile />
        <article className="w-[80%] h-auto flex flex-col justify-start items-start gap-8 pt-12 px-6 relative">
          <div className="flex justify-start items-center gap-3">
            <span className="text-xl font-semibold py-1 pr-4 border-r border-black/20">
              Compartilhe seu App
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
                Compartilhe seu App
              </span>
            </span>
          </div>
          <div className="flex flex-col justify-center items-start w-full bg-white border border-black/30 rounded-md">
            <div className="w-full mt-2">
              <div className="w-full pl-5 py-4 border-b border-black/20">
                <ul className="w-full flex justify-start items-center gap-4">
                  <li className="flex justify-start items-center gap-2 font-semibold">
                    <ShieldUser className="w-5 h-5 text-main-pink"></ShieldUser>{" "}
                    Link para Administrador
                  </li>
                </ul>
              </div>

              <div className="w-full px-5 py-4 border-b border-black/20">
                <div className="w-full flex justify-between items-center">
                  <div className="flex flex-col justify-center items-center">
                    <span className="font-semibold text-main-purple">
                      Para você!
                    </span>
                  </div>
                  <div className="flex justify-center items-center">
                    <span className="font-normal text-sm">
                      {userProfile.link_app}
                    </span>
                  </div>
                  <a
                    href={userProfile.link_app}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative flex justify-center items-center cursor-pointer bg-main-pink/20 p-2 rounded-xl hover:bg-main-pink text-main-pink hover:text-white"
                  >
                    <ExternalLink className="w-6 h-6 group-hover:animate-scale"></ExternalLink>
                  </a>
                </div>
              </div>
              <div className="w-full px-5 py-4 border-b border-black/20">
                <div className="w-full flex justify-center items-center">
                  <div className="text-red-600 text-sm font-bold flex justify-center items-center gap-2">
                    <TriangleAlert className="w-7 h-7 animate-bounce"></TriangleAlert>
                    <span>
                      Não compartilhe esse link, acesso limitado ao
                      administrador com email e senha de usuário.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center items-start w-full bg-white border border-black/30 rounded-md">
            <div className="w-full mt-2">
              <div className="w-full pl-5 py-4 border-b border-black/20">
                <ul className="w-full flex justify-start items-center gap-4">
                  <li className="flex justify-start items-center gap-2 font-semibold">
                    <LinkIcon className="w-5 h-5 text-main-pink"></LinkIcon>{" "}
                    Link para Compartilhar com Clientes
                  </li>
                </ul>
              </div>

              <div className="w-full px-5 py-4 border-b border-black/20">
                <div className="w-full flex justify-between items-center">
                  <div className="flex flex-col justify-center items-center">
                    <span className="font-semibold text-main-purple">
                      Para seus clientes
                    </span>
                  </div>
                  <div className="flex justify-center items-center">
                    <span className="font-normal text-sm">
                      {userProfile.link_share_app}
                    </span>
                  </div>
                  <div
                    onClick={copyToLink}
                    className="relative flex justify-center items-center cursor-pointer bg-main-pink/20 p-2 rounded-xl hover:bg-main-pink text-main-pink hover:text-white"
                  >
                    <Copy className="w-6 h-6 group-hover:animate-scale"></Copy>
                    <div
                      className={`py-2 bg-gray-800 rounded-md px-4 flex justify-center items-center absolute top-0 bottom-0 right-full pointer-events-none transform ${
                        copyLink
                          ? "opacity-100 -translate-x-4"
                          : "-translate-x-2 opacity-0"
                      } transition-all duration-300`}
                    >
                      <span className="text-white text-sm">Copiado!</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full px-5 py-4 border-b border-black/20">
                <div className="w-full flex justify-center items-center">
                  <div className="text-blue-600 text-sm font-bold flex justify-center items-center gap-2">
                    <TriangleAlert className="w-7 h-7 animate-bounce"></TriangleAlert>
                    <span>
                      Ao compartilhar este link com seus clientes, eles terão
                      acesso a sua agenda e poderão reservar horários.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
