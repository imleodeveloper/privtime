"use client";
import {
  Ban,
  CheckCircle,
  ChevronDown,
  CircleAlert,
  CircleEllipsis,
  Cog,
  Home,
  IdCard,
  SidebarOpen,
  Trash,
  TriangleAlert,
  UserCog,
  UserX,
  X,
} from "lucide-react";
import { Footer } from "../../../../components/footer";
import { Header } from "../../../../components/header";
import { NavigationProfile } from "../../../../components/profile/navigation-profile";
import Link from "next/link";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../../../../lib/supabase";
import { UserPlan, UserProfile } from "@/app/api/auth/perfil/route";
import { formatDate, formatPrice } from "../../../../lib/plans";
import { Banner } from "../../../../components/banner-alert";
import { useRouter } from "next/navigation";

export default function InformacoesDeConta() {
  const router = useRouter();
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const [typeAlert, setTypeAlert] = useState<"error" | "success">("error");
  const [isAlert, setIsAlert] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [openMenu, setOpenMenu] = useState<boolean>(false);
  const divRef = useRef<HTMLDivElement>(null);
  const [deleteAccount, setDeleteAccount] = useState<boolean>(false);
  const [copyLink, setCopyLink] = useState<boolean>(false);
  const [changeSlug, setChangeSlug] = useState<boolean>(false);
  const [detailsPlan, setDetailsPlan] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    user_id: "",
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
    edit_slug: 0,
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
    automatic_renewal: false,
  });
  const [userChangeSlug, setUserChangeSlug] = useState({
    newSlug: "",
  });

  useEffect(() => {
    handleSession();
  }, []);

  const handleSession = async () => {
    setIsLoading(true);
    try {
      const { data: sessionUser } = await supabase.auth.getSession();
      const sessionToken = sessionUser.session?.access_token;

      // Se não tiver sessão, já redireciona sem nem chamar a API
      if (!sessionToken) {
        setIsLoading(false);
        router.push("/signin?redirect=/perfil");
        return;
      }

      const response = await fetch("/api/auth/perfil", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setIsLoading(false);
        setTypeAlert("error");
        setShowAlert(true);
        setIsAlert(
          "Não foi possível encontrar usuário. Redirecionando para o login."
        );
        setTimeout(() => router.push("/signin?redirect=/perfil"), 1000);
        return;
      }

      setUserPlan(data.planOfUser);
      setUserProfile(data.profile);
      setIsLoading(false);
    } catch (error) {
      console.error("Não foi possível encontrar sessão ativa", error);
      setIsLoading(false);
      setTimeout(() => router.push("/signin?redirect=/perfil"), 3000);
      return;
    }
  };

  const handleChangeSlug = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/perfil/alterar-slug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userProfile, userChangeSlug }),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsLoading(false);
        setTypeAlert("error");
        setIsAlert(data.message);
        setShowAlert(!showAlert);
        return;
      }

      if (response.status === 200) {
        setIsLoading(false);
        setTypeAlert("success");
        setIsAlert(data.message);
        setShowAlert(!showAlert);
      }
    } catch (error) {
      console.error("Erro do servidor:", error);
      setTypeAlert("error");
      setIsAlert("Não foi possível alterar slug, erro interno do servidor");
      setShowAlert(!showAlert);
      setIsLoading(false);
      return;
    } finally {
      setChangeSlug(false);
      handleSession();
    }
  };

  useEffect(() => {
    if (deleteAccount && divRef.current) {
      divRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [deleteAccount]);

  const handleDeleteAccount = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      const userId = user.user?.id;

      const responseDelete = await fetch("/api/auth/perfil/delete-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await responseDelete.json();

      if (data.error === true) {
        setTypeAlert("error");
        setIsAlert(data.message);
        setShowAlert(!showAlert);
        setTimeout(
          () => (window.location.href = "/signin?redirect=/perfil"),
          5000
        );
        return;
      }

      if (data.error === false) {
        setTypeAlert("success");
        setIsAlert(data.message);
        setShowAlert(!showAlert);
        await supabase.auth.signOut();
        setTimeout(() => (window.location.href = "/signup"), 2000);
        return;
      }
    } catch (error) {
      console.error("Não foi possível deletar conta de usuário: ", error);
      setTypeAlert("error");
      setIsAlert("Não foi possível deletar conta, erro interno do servidor.");
      setShowAlert(!showAlert);
      return;
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

  console.log(userProfile);
  return (
    <>
      <Banner
        type={typeAlert}
        show={showAlert}
        hide={() => setShowAlert(false)}
        message={isAlert}
      />
      <Header />
      <main className="w-full min-h-screen flex justify-center items-start pb-20">
        <NavigationProfile open={openMenu} onClose={() => setOpenMenu(false)} />
        <article className="relative w-full lg:w-[80%] h-auto flex flex-col justify-start items-start gap-8 pt-24 lg:pt-12 px-6">
          <div
            className="lg:hidden absolute top-4 left-4 flex justify-center items-center p-2 cursor-pointer hover:bg-main-pink hover:text-white rounded-full lg:hidden"
            onClick={() => setOpenMenu(!openMenu)}
          >
            <SidebarOpen className="w-7 h-7"></SidebarOpen>
          </div>
          <div className="flex justify-center sm:justify-start items-center gap-3">
            <span className="text-xl font-semibold text-center sm:text-start py-1 pr-4 border-r border-black/20">
              Informações de Conta
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
                Informações de Conta
              </span>
            </span>
          </div>
          <div className="flex flex-col justify-center items-start w-full bg-white border border-black/30 rounded-md">
            <div className="w-full mt-2">
              <div className="w-full pl-5 py-4 border-b border-black/20">
                <ul className="w-full flex justify-start items-center gap-4">
                  <li className="flex justify-start items-center gap-2 font-semibold">
                    <IdCard className="w-5 h-5 text-main-pink"></IdCard>{" "}
                    Informações Pessoais
                  </li>
                </ul>
              </div>

              <div className="w-full px-5 py-4 border-b border-black/20">
                <div className="w-full flex justify-between items-center">
                  <div className="flex flex-col justify-center items-center">
                    <span className="font-normal text-sm text-gray-500">
                      Nome
                    </span>
                  </div>
                  <div className="flex justify-center items-center">
                    <span className="font-normal text-sm">
                      {userProfile.full_name}
                    </span>
                  </div>
                  <div className="flex justify-center items-center pointers-events-none bg-main-pink/20 p-2 rounded-xl text-gray-500">
                    {/* // className="group flex justify-center items-center cursor-pointer bg-main-pink/20 p-2 rounded-xl hover:bg-main-pink text-main-pink hover:text-white"> */}
                    <Cog className="w-6 h-6 group-hover:animate-spin"></Cog>
                  </div>
                </div>
              </div>
              <div className="w-full px-5 py-4 border-b border-black/20">
                <div className="w-full flex justify-between items-center">
                  <div className="flex flex-col justify-center items-center">
                    <span className="font-normal text-sm text-gray-500">
                      Telefone
                    </span>
                  </div>
                  <div className="flex justify-center items-center">
                    <span className="font-normal text-sm">
                      {userProfile.phone}
                    </span>
                  </div>
                  <div className="flex justify-center items-center pointers-events-none bg-main-pink/20 p-2 rounded-xl text-gray-500">
                    {/* // className="group flex justify-center items-center cursor-pointer bg-main-pink/20 p-2 rounded-xl hover:bg-main-pink text-main-pink hover:text-white"> */}
                    <Cog className="w-6 h-6 group-hover:animate-spin"></Cog>
                  </div>
                </div>
              </div>
              <div className="w-full px-5 py-4 border-b border-black/20">
                <div className="w-full flex justify-between items-center">
                  <div className="flex flex-col justify-center items-center">
                    <span className="font-normal text-sm text-gray-500">
                      Endereço
                    </span>
                  </div>
                  <div className="flex justify-center items-center">
                    <span className="font-normal text-sm">--</span>
                  </div>
                  <div className="flex justify-center items-center pointers-events-none bg-main-pink/20 p-2 rounded-xl text-gray-500">
                    <Cog className="w-6 h-6"></Cog>
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
                    <UserCog className="w-5 h-5 text-main-pink"></UserCog>{" "}
                    Configurações de Conta
                  </li>
                </ul>
              </div>

              <div className="w-full px-5 py-4 border-b border-black/20">
                <div className="w-full flex justify-between items-center">
                  <div className="flex flex-col justify-center items-center">
                    <span className="font-normal text-sm text-gray-500">
                      Trocar Slug
                    </span>
                  </div>
                  <div className="flex justify-center items-center">
                    <span className="font-normal text-sm">
                      {userProfile.slug_link}
                    </span>
                  </div>
                  <div
                    className="group flex justify-center items-center cursor-pointer bg-main-pink/20 p-2 rounded-xl hover:bg-main-pink text-main-pink hover:text-white"
                    onClick={() => setChangeSlug(!changeSlug)}
                  >
                    <Cog className="w-6 h-6 group-hover:animate-spin"></Cog>
                  </div>
                </div>
              </div>
              <div className="w-full px-5 py-4 border-b border-black/20">
                <div className="w-full flex justify-between items-center">
                  <div className="flex flex-col justify-center items-center">
                    <span className="font-normal text-sm text-gray-500">
                      Email
                    </span>
                  </div>
                  <div className="flex justify-center items-center">
                    <span className="font-normal text-sm">
                      {userProfile.email}
                    </span>
                  </div>
                  <div className="flex justify-center items-center pointers-events-none bg-main-pink/20 p-2 rounded-xl text-gray-500">
                    {/* className="group flex justify-center items-center cursor-pointer bg-main-pink/20 p-2 rounded-xl hover:bg-main-pink text-main-pink hover:text-white"> */}
                    <Cog className="w-6 h-6 group-hover:animate-spin"></Cog>
                  </div>
                </div>
              </div>
              <div className="w-full px-5 py-4 border-b border-black/20">
                <div className="w-full flex justify-between items-center">
                  <div className="flex flex-col justify-center items-center">
                    <span className="font-normal text-sm text-gray-500">
                      Trocar senha
                    </span>
                  </div>
                  <div className="flex justify-center items-center">
                    <span className="font-normal text-sm">••••••••</span>
                  </div>
                  <div className="flex justify-center items-center pointers-events-none bg-main-pink/20 p-2 rounded-xl text-gray-500">
                    {/* className="group flex justify-center items-center cursor-pointer bg-main-pink/20 p-2 rounded-xl hover:bg-main-pink text-main-pink hover:text-white"> */}
                    <Cog className="w-6 h-6 group-hover:animate-spin"></Cog>
                  </div>
                </div>
              </div>
              <div className="w-full px-5 py-4 border-b border-black/20">
                <div className="w-full flex justify-between items-center">
                  <div className="flex flex-col justify-center items-center">
                    <span className="font-normal text-sm text-gray-500">
                      Criado em
                    </span>
                  </div>
                  <div className="flex justify-center items-center">
                    <span className="font-normal text-sm">
                      {formatDate(userProfile.created_at)}
                    </span>
                  </div>
                  <div></div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col justify-center items-start w-full bg-white border border-black/30 rounded-md">
            <div className="w-full mt-2">
              <div className="w-full pl-5 py-4 border-b border-black/20">
                <ul className="w-full flex justify-start items-center gap-4">
                  <li className="flex justify-start items-center gap-2 font-semibold">
                    <UserX className="w-5 h-5 text-main-pink"></UserX> Conta
                  </li>
                </ul>
              </div>

              <div className="w-full px-5 py-4 border-b border-black/20">
                <div className="w-full flex flex-col gap-6 sm:gap-0 sm:flex-row justify-center sm:justify-between items-center">
                  <div className="flex flex-col justify-center items-start">
                    <span className="font-normal text-black">
                      Excluir conta
                    </span>
                    <span className="font-normal text-sm text-gray-500">
                      Saiba que ao excluir sua conta, todas as informações
                      ligadas a ela serão removidas sem a possibilidade de
                      restauração.
                    </span>
                  </div>
                  <Button
                    className="flex justify-center items-center gap-2 text-white text-sm"
                    onClick={() => setDeleteAccount(!deleteAccount)}
                  >
                    <Trash className="w-4 h-4"></Trash> Excluir
                  </Button>
                </div>
              </div>
            </div>
          </div>
          {deleteAccount && (
            <div className="absolute w-full h-full top-0 left-0 flex justify-center items-center backdrop-blur-md">
              <div
                ref={divRef}
                className="max-w-lg border border-black/40 rounded-md bg-sub-background h-auto p-4 flex justify-between items-center flex-col"
              >
                <div className="w-full flex justify-start items-center pb-2 border-b border-black/30">
                  <span className="text-lg font-bold">Deletar conta</span>
                </div>
                <div className="w-full flex justify-center items-center gap-4 py-4">
                  <span className="font-normal">
                    Você tem certeza que deseja deletar sua conta? Lembrando ao
                    clicar em deletar{" "}
                    <span className="underline text-red-600 font-bold">
                      não será possível recuperar nenhum dados
                    </span>
                    .
                  </span>
                </div>
                <div className="w-full flex justify-end items-center gap-2 py-2">
                  <Button
                    className="bg-red-600 text-white hover:bg-red-900 flex justify-center items-center gap-2 text-sm"
                    onClick={handleDeleteAccount}
                  >
                    Deletar
                  </Button>
                  <Button
                    className="bg-sub-background border border-main-pink/60 hover:text-white flex justify-center items-center gap-2 text-sm"
                    onClick={() => setDeleteAccount(!deleteAccount)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </article>
        {changeSlug && (
          <>
            <div className="w-full h-screen fixed top-0 left-0 z-10 backdrop-blur-md flex justify-center items-center">
              <form
                onSubmit={handleChangeSlug}
                className="w-[90%] lg:w-md flex flex-col justify-center items-center p-4 bg-sub-background rounded-md border border-black/30"
              >
                <div className="w-full flex justify-start items-center pb-3 border-b border-black/20">
                  <span className="text-xl text-main-pink font-bold">
                    Alterar slug
                  </span>
                </div>
                <div className="flex flex-col justify-start items-start py-3 w-full gap-4">
                  <div className="flex flex-col justify-start items-start w-full gap-2">
                    <label className="text-gray-800 font-normal">
                      Slug atual:
                    </label>
                    <Input
                      className="text-gray-600"
                      type="text"
                      value={userProfile.slug_link}
                      readOnly
                      disabled
                    />
                  </div>
                  <div className="flex flex-col justify-start items-start w-full gap-2">
                    <label
                      className="text-gray-800 font-normal"
                      htmlFor="newSlug"
                    >
                      Informe sua nova slug (max: 50 caracteres):
                    </label>
                    <Input
                      type="text"
                      maxLength={50}
                      id="newSlug"
                      required
                      onChange={(e) =>
                        setUserChangeSlug({
                          ...userChangeSlug,
                          newSlug: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-center items-center py-3 w-full gap-2">
                  <Button
                    type="submit"
                    className="text-white border border-main-purple hover:border-main-pink"
                  >
                    {isLoading ? "Confirmando..." : "Confirmar slug"}
                  </Button>
                  <Button
                    className="bg-transparent border border-main-pink hover:text-white"
                    onClick={() => setChangeSlug(false)}
                  >
                    Cancelar
                  </Button>
                </div>
                <div className="flex flex-col gap-4 justify-center items-center text-center">
                  <span
                    className={`text-red-600 font-bold text-sm ${
                      userProfile.edit_slug >= 2 ? "hidden" : "visible"
                    }`}
                  >
                    Atenção: a slug pode ser alterada apenas duas vezes. Escolha
                    com cuidado.
                  </span>
                  <span className="text-sm text-gray-700">
                    {userProfile.edit_slug < 2 ? <>Você alterou: </> : <></>}

                    <span className="font-semibold">
                      {userProfile.edit_slug == 0 && <>nenhuma vez</>}
                      {userProfile.edit_slug == 1 && <>01 vez</>}
                      {userProfile.edit_slug >= 2 && <>Limite excedido</>}
                    </span>
                  </span>
                </div>
              </form>
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
