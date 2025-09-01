"use client";
import {
  Ban,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  CircleEllipsis,
  Copy,
  Home,
  MoveDown,
  Search,
  SidebarOpen,
  TriangleAlert,
  X,
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
import { useSearchParams } from "next/navigation";
import { Banner } from "../../../../components/banner-alert";

export default function Assinaturas() {
  const searchParams = new URLSearchParams(window.location.search);
  const msgParams = searchParams.get("msg");
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [typeAlert, setTypeAlert] = useState<"error" | "success">("error");
  const [isAlert, setIsAlert] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [openMenu, setOpenMenu] = useState<boolean>(false);
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
    checkParams();
  }, []);

  const checkParams = () => {
    if (msgParams === "existing_plan") {
      setTypeAlert("error");
      setShowAlert(!showAlert);
      setIsAlert(
        "Você já possui um plano ativo vinculado ao seu perfil. Para realizar uma renovação ou reativação, acesse a página Assinaturas no seu perfil."
      );
    }
  };

  useEffect(() => {
    handleHideAlert();
  }, [showAlert]);

  const handleHideAlert = () => {
    if (showAlert) {
      setTimeout(() => setShowAlert(false), 5000);
    }
  };

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

  const copyToLink = () => {
    navigator.clipboard.writeText(userPlan.subscription_id).then(() => {
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
      <Banner
        type={typeAlert}
        show={showAlert}
        hide={() => setShowAlert(false)}
        message={isAlert}
      />
      <Header />
      <main className="w-full h-auto pb-20 flex justify-center items-start">
        <NavigationProfile open={openMenu} onClose={() => setOpenMenu(false)} />
        <article className="relative w-full lg:w-[80%] h-auto flex flex-col justify-start items-start gap-8 pt-24 lg:pt-12 px-6">
          <div
            className="lg:hidden absolute top-4 left-4 flex justify-center items-center p-2 cursor-pointer hover:bg-main-pink hover:text-white rounded-full lg:hidden"
            onClick={() => setOpenMenu(!openMenu)}
          >
            <SidebarOpen className="w-7 h-7"></SidebarOpen>
          </div>
          <div className="flex justify-start items-center gap-3">
            <span className="text-xl font-semibold py-1 pr-4 border-r border-black/20">
              Assinaturas
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
                Assinaturas
              </span>
            </span>
          </div>
          <div className="flex flex-col justify-center items-start w-full bg-white border border-black/30 rounded-md">
            <div className="w-full p-4 relative">
              <input
                type="text"
                disabled
                className="w-full border border-black/40 py-2 px-4 rounded-md"
                placeholder="Funcionalidade de pesquisar ainda não disponível"
              ></input>
            </div>
            <div className="hidden md:block w-full mt-8">
              <div className="w-full pl-5 py-4 border-b border-black/20">
                <ul className="w-full grid grid-cols-[1fr_1fr_1fr_2fr] items-center gap-4">
                  <li className="flex justify-start items-center gap-2 text-sm font-semibold">
                    Assinatura <ChevronDown className="w-4 h-4"></ChevronDown>
                  </li>
                  <li className="flex justify-center items-center gap-2 text-sm font-semibold">
                    Data de expiração{" "}
                    <ChevronDown className="w-4 h-4"></ChevronDown>
                  </li>
                  <li className="flex justify-center items-center gap-2 text-sm font-semibold">
                    Renovação automática{" "}
                    <ChevronDown className="w-4 h-4"></ChevronDown>
                  </li>
                </ul>
              </div>

              <div className="w-full pl-5 py-4 border-b border-black/20">
                <ul className="w-full grid grid-cols-[1fr_1fr_1fr_2fr] items-center gap-4">
                  <li className="flex justify-start items-center gap-2 font-semibold">
                    <div className="flex flex-col justify-center items-start">
                      <span className="font-normal text-base">
                        Plano {userPlan.plan_type}
                      </span>
                      <span className="font-normal text-sm text-gray-500">
                        {userProfile.slug_link}
                      </span>
                    </div>
                  </li>
                  <li className="flex justify-center items-center gap-2 font-normal text-base">
                    {userPlan.plan_slug === "trial_plan"
                      ? "7 dias após criar conta"
                      : formatDate(userPlan.expires_at)}
                  </li>
                  <li className="flex justify-center items-center gap-2 font-normal">
                    <div
                      className={`${
                        userPlan.plan_slug === "trial_plan"
                          ? "bg-red-200 text-red-800"
                          : "bg-green-200 text-green-800"
                      } p-2 rounded-xl text-sm font-semibold`}
                    >
                      {userPlan.plan_slug === "trial_plan"
                        ? "Desligado"
                        : "Ligado"}
                    </div>
                  </li>
                  <li className="flex justify-center items-center gap-4">
                    <Button className="text-sm font-semibold text-white">
                      Configurar renovação
                    </Button>
                    <div
                      className="p-1 bg-main-pink/20 hover:bg-main-pink cursor-pointer hover:text-white rounded-md flex justify-center items-center"
                      onClick={() => setDetailsPlan(!detailsPlan)}
                    >
                      <span className="text-center flex justify-center items-center">
                        <CircleEllipsis className="w-7 h-7"></CircleEllipsis>
                      </span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <div className="md:hidden w-full mt-8 flex justify-center items-center">
              <div className="w-1/2 p-4 border-r border-black/20">
                <ul className="w-full flex justify-start items-start flex-col lg:items-center gap-8">
                  <li className="w-full flex justify-between items-center gap-2 text-sm font-semibold">
                    Assinatura <ChevronRight className="w-4 h-4"></ChevronRight>
                  </li>
                  <li className="w-full flex justify-between items-center gap-2 text-sm font-semibold">
                    Data de expiração{" "}
                    <ChevronRight className="w-4 h-4"></ChevronRight>
                  </li>
                  <li className="w-full flex justify-between items-center gap-2 text-sm font-semibold">
                    Renovação automática{" "}
                    <ChevronRight className="w-4 h-4"></ChevronRight>
                  </li>
                </ul>
              </div>

              <div className="w-1/2 pl-5 py-4">
                <ul className="w-full flex justify-start flex-col items-start gap-8">
                  <li className="flex justify-start items-center gap-2 font-semibold">
                    <div className="flex flex-col justify-center items-start">
                      <span className="font-normal text-base">
                        Plano {userPlan.plan_type}
                      </span>
                      <span className="font-normal text-sm text-gray-500">
                        {userProfile.slug_link}
                      </span>
                    </div>
                  </li>
                  <li className="flex justify-center items-center gap-2 font-normal text-base">
                    {userPlan.plan_slug === "trial_plan"
                      ? "7 dias após criar conta"
                      : formatDate(userPlan.expires_at)}
                  </li>
                  <li className="flex justify-center items-center gap-2 font-normal">
                    <div className="bg-green-200 p-2 rounded-xl text-sm font-semibold text-green-800">
                      {userPlan.plan_slug === "trial_plan"
                        ? "Gratuito"
                        : "Ligado"}
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <div className="md:hidden w-full py-4 flex justify-center items-center">
              <ul className="w-full flex justify-center items-center">
                <li className="flex justify-center items-center gap-4">
                  <Button className="text-sm font-semibold text-white">
                    Configurar renovação
                  </Button>
                  <div
                    className="p-1 bg-main-pink/20 hover:bg-main-pink cursor-pointer hover:text-white rounded-md flex justify-center items-center"
                    onClick={() => setDetailsPlan(!detailsPlan)}
                  >
                    <span className="text-center flex justify-center items-center">
                      <CircleEllipsis className="w-7 h-7"></CircleEllipsis>
                    </span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div
            className={`h-screen w-[85%] md:w-[40%] bg-white/40 fixed top-0 right-0 backdrop-blur-lg flex justify-start items-start p-10 md:p-6 transition-all duration-500 ${
              detailsPlan
                ? "translate-x-0 pointers-events-auto"
                : "translate-x-full pointers-events-none"
            }`}
          >
            <div
              className="absolute top-3 right-3 bg-main-pink text-white hover:bg-main-purple cursor-pointer p-2 rounded-full shadow-xl"
              onClick={() => setDetailsPlan(!detailsPlan)}
            >
              <X className="w-5 h-5"></X>
            </div>
            <div className="w-full flex flex-col justify-start items-start gap-4">
              <span className="text-2xl font-bold">Detalhes do plano</span>
              <div className="flex flex-col justify-start items-start gap-1">
                <span className="text-lg font-bold">
                  Plano {userPlan.plan_type}
                </span>
                <span className="text-sm font-normal text-gray-600">
                  {userProfile.slug_link}
                </span>
              </div>
              <div className="w-full py-3 border-b border-black/20 mt-6 flex justify-between items-center">
                <span className="text-sm">Status</span>
                <div className="flex justify-center items-center gap-2">
                  {userPlan.status === "active" && (
                    <>
                      <CheckCircle className="w-6 h-6 text-green-600"></CheckCircle>
                      <span className="text-sm">Ativo</span>
                    </>
                  )}
                  {userPlan.status === "pending" && (
                    <>
                      <CircleAlert className="w-6 h-6 text-orange-600"></CircleAlert>
                      <span className="text-sm">Pendente</span>
                    </>
                  )}
                  {userPlan.status === "failed" && (
                    <>
                      <TriangleAlert className="w-6 h-6 text-red-600"></TriangleAlert>
                      <span className="text-sm">Falha no pagamento</span>
                    </>
                  )}
                  {userPlan.status === "inactive" && (
                    <>
                      <Ban className="w-6 h-6 text-gray-600"></Ban>
                      <span className="text-sm">Desativado</span>
                    </>
                  )}
                </div>
              </div>
              <div className="w-full py-3 border-b border-black/20 flex justify-between items-center">
                <span className="text-sm">Data de expiração</span>
                <div className="flex justify-center items-center gap-2">
                  <span className="text-sm">
                    {userPlan.plan_slug === "trial_plan"
                      ? "7 dias após criar conta"
                      : formatDate(userPlan.expires_at)}
                  </span>
                </div>
              </div>
              <div className="w-full py-3 border-b border-black/20 flex justify-between items-center">
                <span className="text-sm">Preço de renovação</span>
                <div className="flex justify-center items-center gap-2">
                  <span className="text-sm">
                    {formatPrice(userPlan.price_at_purchase)}
                  </span>
                </div>
              </div>
              <div className="w-full py-3 border-b border-black/20 flex justify-between items-center">
                <span className="text-sm">ID da assinatura</span>
                <div className="flex justify-center items-center gap-2">
                  {/* <Copy className="w-5 h-5 text-main-pink cursor-pointer"></Copy> */}
                  <span className="text-sm">{userPlan.subscription_id}</span>
                </div>
              </div>
              <div className="w-full py-3 flex justify-start items-center">
                <span className="text-sm text-gray-700">
                  Precisa de alguma ajuda?{" "}
                  <a
                    href="https://wa.me/1199999999"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-main-pink hover:text-main-purple"
                  >
                    Fale com nossa equipe.
                  </a>
                </span>
              </div>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
