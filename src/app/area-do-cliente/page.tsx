"use client";
import Image from "next/image";
import { Footer } from "../../../components/footer";
import { Header } from "../../../components/header";
import Link from "next/link";
import {
  BadgeInfo,
  Check,
  Copy,
  Crown,
  ExternalLink,
  Facebook,
  Instagram,
  Minimize2,
  Pencil,
  Receipt,
  ShoppingBag,
  Youtube,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { plans } from "../../../lib/plans";
import { formatPrice } from "../../../lib/plans";
import { supabase } from "../../../lib/supabase";

interface Profile {
  email: string;
  full_name: string;
  identity: string;
  phone: number;
  created_at: string;
  updated_at: string;
  whats_plan: string | null;
}

export default function AreaCliente() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [planDetail, setPlanDetail] = useState(false);
  const [configAccount, setConfigAccount] = useState(false);
  const [fetchProfile, setFetchProfile] = useState<Profile>({
    email: "",
    full_name: "",
    identity: "",
    phone: 0,
    created_at: "",
    updated_at: "",
    whats_plan: "",
  });

  const changeStateDetail = () => {
    if (planDetail === false) {
      setPlanDetail(true);
    } else if (planDetail === true) {
      setPlanDetail(false);
    }
  };

  useEffect(() => {
    const handleSession = async () => {
      try {
        const { data: sessionUser } = await supabase.auth.getSession();
        console.log(sessionUser);
        const userId = sessionUser.session?.user.id;
        const sessionToken = sessionUser.session?.access_token;
        console.log("userId: ", userId);
        const response = await fetch("/api/auth/area-do-cliente", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken}`,
          },
        });

        const data = await response.json();
        console.log("Data Sessão API: ", data);
      } catch (err) {
        // FAZER LÓGICA DE ERRO
        console.log("Erro");
      }
    };

    handleSession();
  }, []);

  return (
    <div className="w-full">
      <Header />
      <main className="w-full py-14 relative">
        <article className="w-full container mx-auto">
          {isAuthenticated && (
            <section className="min-h-screen grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-2 md:gap-8 px-4 lg:px-0">
              <div className="rounded-xl flex flex-col justify-start items-center gap-2 overflow-hidden">
                <div className="bg-sub-background flex flex-col justify-start items-center overflow-hidden rounded-xl w-full pb-4">
                  <div className="w-full h-52 relative">
                    <Image
                      src="/privtime-white-16-9.png"
                      alt=""
                      fill
                      className="object-cover object-[50%_35%]"
                    />
                    <div className="absolute -bottom-12 left-8 rounded-full overflow-hidden">
                      <Image
                        src="/privtime-black.png"
                        alt=""
                        width={120}
                        height={120}
                      />
                    </div>
                  </div>
                  <div className="w-full pt-18 px-8 flex flex-col justify-start items-start gap-1 relative">
                    <span className="text-2xl font-semibold">
                      Fulano Ciclano
                    </span>
                    <span className="text-lg font-medium">
                      email@dominio.com
                    </span>
                    <span className="text-lg font-medium">000.000.000-00</span>
                    <Link
                      href=""
                      className="text-base font-semibold text-blue-600 hover:text-blue-800 underline flex justify-start items-center gap-1"
                    >
                      Link App
                      <ExternalLink className="w-4 h-4"></ExternalLink>
                    </Link>
                  </div>
                </div>
                <div className="bg-sub-background w-full rounded-xl overflow-hidden px-8 py-4">
                  <span className="text-2xl font-semibold">
                    Detalhes do Plano -{" "}
                    <span className="text-xl font-bold text-main-pink">
                      App Mensal
                    </span>
                  </span>
                  <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0 pt-6">
                    <div className="flex justify-start items-start gap-2">
                      <ShoppingBag className="w-6 h-6 text-main-pink"></ShoppingBag>
                      <div className="flex flex-col justify-start items-start">
                        <span className="text-lg font-semibold">
                          Data de Compra:
                        </span>
                        <span className="text-base text-gray-700">
                          01/07/2025
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-start items-start gap-2">
                      <Receipt className="w-6 h-6 text-main-pink"></Receipt>
                      <div className="flex flex-col justify-start items-start">
                        <span className="text-lg font-semibold">
                          Próximo Pagamento:
                        </span>
                        <span className="text-base text-gray-700">
                          01/08/2025
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-start items-start gap-2">
                      <BadgeInfo className="w-6 h-6 text-main-pink"></BadgeInfo>
                      <div className="flex flex-col justify-start items-start">
                        <span className="text-lg font-semibold">
                          Conferir Detalhes do Plano:
                        </span>
                        <span
                          className="text-base text-blue-600 hover:text-blue-800 underline cursor-pointer font-semibold"
                          onClick={changeStateDetail}
                        >
                          Detalhes
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                {planDetail === true && (
                  <div className="bg-sub-background w-full rounded-xl overflow-hidden flex flex-col justify-start items-start gap-2 px-8 py-4">
                    <span className="text-xl font-semibold">
                      Tipo do plano:{" "}
                      <span className="text-main-pink text-base">Mensal</span>
                    </span>
                    <span className="text-xl font-semibold">
                      Status do plano:{" "}
                      <span className="text-green-800 bg-green-200 text-base px-2 py-1 rounded-full">
                        Ativo
                      </span>
                    </span>
                    <span>
                      <span className="font-bold text-xl text-main-pink">
                        {formatPrice(150)}
                      </span>{" "}
                      <span className="text-base text-gray-700">/mês</span>
                    </span>
                    <div className="flex flex-col justify-start items-start pt-4">
                      <span className="text-base text-main-pink font-bold">
                        Recursos Inclusos:
                      </span>
                      {plans[0].features.map((feature, index) => (
                        <ul
                          key={index}
                          className="flex flex-col justify-start items-start gap-4"
                        >
                          <li className="flex justify-start items-center text-base text-gray-700">
                            <Check className="w-5 h-5 text-green-600"></Check>{" "}
                            {feature}
                          </li>
                        </ul>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="rounded-xl overflow-hidden flex flex-col justify-start items-center gap-2">
                <div className="w-full bg-sub-background rounded-xl overflow-hidden flex flex-col justify-start items-start px-4 py-4">
                  <div className="w-full relative flex justify-start items-start flex-col pb-4 border-b border-gray-400">
                    <span className="font-semibold text-base">
                      Configurações da Conta
                    </span>
                    <span className="text-sm text-gray-700">
                      Senha, e-mail...
                    </span>
                    <div
                      className="absolute top-0 right-0 flex justify-center items-center cursor-pointer hover:bg-main-pink p-2 rounded-full hover:text-white"
                      onClick={() => setConfigAccount(true)}
                    >
                      <Pencil className="w-4 h-4"></Pencil>
                    </div>
                  </div>
                  <div className="w-full relative flex justify-start items-start flex-col py-4">
                    <span className="font-semibold text-base">
                      Link de Clientes App
                    </span>
                    <span className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer hover:underline">
                      https://www.privtime.com/user34345/link3234
                    </span>
                    <div className="absolute top-1 right-0 flex justify-center items-center cursor-pointer hover:bg-main-pink p-2 rounded-full hover:text-white">
                      <Copy className="w-4 h-4"></Copy>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-sub-background rounded-xl overflow-hidden flex flex-col justify-start items-center gap-2 px-4 py-4">
                  <div className="rounded-full overflow-hidden relative w-24 h-24">
                    <Image src="/privtime-black.png" fill alt="" />
                  </div>
                  <span className="text-gray-700 font-medium text-center">
                    Nos siga em nossas redes sociais
                  </span>
                  <div className="flex justify-center items-center gap-2">
                    <Link
                      href=""
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full overflow-hidden shadow-xl bg-main-pink text-white cursor-pointer hover:bg-main-purple"
                    >
                      <Instagram className="w-6 h-6"></Instagram>
                    </Link>
                    <Link
                      href=""
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full overflow-hidden shadow-xl bg-main-pink text-white cursor-pointer hover:bg-main-purple"
                    >
                      <Facebook className="w-6 h-6"></Facebook>
                    </Link>
                    <Link
                      href=""
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-full overflow-hidden shadow-xl bg-main-pink text-white cursor-pointer hover:bg-main-purple"
                    >
                      <Youtube className="w-6 h-6"></Youtube>
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          )}
          {!isAuthenticated && (
            <section className="min-h-screen grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-2 md:gap-8 px-4 lg:px-0">
              <div className="rounded-xl flex flex-col justify-start items-center gap-2 overflow-hidden">
                <div className="bg-sub-background flex flex-col justify-start items-center overflow-hidden rounded-xl w-full pb-4">
                  <div className="w-full h-52 relative">
                    <Image
                      src="/privtime-white-16-9.png"
                      alt=""
                      fill
                      className="object-cover object-[50%_35%]"
                    />
                    <div className="absolute -bottom-12 left-8 rounded-full overflow-hidden">
                      <Image
                        src="/privtime-black.png"
                        alt=""
                        width={120}
                        height={120}
                      />
                    </div>
                  </div>
                  <div className="w-full pt-18 px-8 flex flex-col justify-start items-start gap-1 relative">
                    <span className="text-2xl font-semibold">
                      Fulano Ciclan
                    </span>
                    <span className="text-lg font-medium">
                      email@dominio.com
                    </span>
                    <span className="text-lg font-medium">000.000.000-00</span>
                    <Link
                      href="/"
                      className="text-base font-semibold text-blue-600 hover:text-blue-800 underline flex justify-start items-center gap-1"
                    >
                      Adquirir App
                      <ExternalLink className="w-4 h-4"></ExternalLink>
                    </Link>
                  </div>
                </div>
                <div className="bg-sub-background w-full rounded-xl overflow-hidden px-8 py-4">
                  <span className="text-2xl font-semibold">Plano Atual</span>
                  <div className="w-full flex justify-center items-center py-32">
                    <div className="flex flex-col justify-center items-center gap-4">
                      <Crown className="w-12 h-12 opacity-35"></Crown>
                      <span className="font-bold text-gray-700 text-xl">
                        Nenhum plano ativo
                      </span>
                      <span className="text-gray-600 text-base">
                        Você ainda não possui um plano ativo. Escolha um plano
                        para começar!
                      </span>
                      <Button className="text-white">
                        Ver planos disponíveis
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-xl overflow-hidden">
                <div className="w-full bg-sub-background rounded-xl overflow-hidden flex flex-col justify-start items-start px-4 py-4">
                  <div className="w-full relative flex justify-start items-start flex-col pb-4 border-b border-gray-400">
                    <span className="font-semibold text-base">
                      Configurações da Conta
                    </span>
                    <span className="text-sm text-gray-700">
                      Senha, e-mail...
                    </span>
                    <div
                      className="absolute top-0 right-0 flex justify-center items-center cursor-pointer hover:bg-main-pink p-2 rounded-full hover:text-white"
                      onClick={() => setConfigAccount(true)}
                    >
                      <Pencil className="w-4 h-4"></Pencil>
                    </div>
                  </div>
                  <div className="w-full relative flex justify-start items-start flex-col pb-4 border-b border-gray-400 py-4">
                    <span className="font-semibold text-base">
                      Como Funciona o App?
                    </span>
                    <Link
                      href="/"
                      className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
                    >
                      Ver video
                    </Link>
                  </div>
                  <div className="w-full relative flex justify-start items-start flex-col py-4">
                    <span className="font-semibold text-base">Ver planos</span>
                    <Link
                      href="/"
                      className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
                    >
                      Planos
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          )}
        </article>
        {configAccount === true && (
          <div className="fixed top-0 left-0 w-full h-full backdrop-blur flex justify-center items-center">
            <div className="bg-sub-background w-auto p-8 h-1/2 shadow-xl rounded-xl relative flex flex-col justify-center items-center">
              <span className="text-center font-bold text-gray-700 mb-6">
                Olá <span className="text-main-pink">Fulano Ciclano</span>!{" "}
                <br />
                Altere o email ou senha aqui
              </span>
              <div className="flex flex-col justify-center items-start gap-1">
                <label htmlFor="email" className="text-sm text-gray-600">
                  E-mail
                </label>
                <input
                  className="w-full bg-white px-2 py-1 rounded-lg"
                  type="text"
                  id="email"
                  defaultValue="email@dominio.com"
                ></input>
              </div>
              <div className="flex flex-col justify-center items-start gap-1">
                <label htmlFor="phone" className="text-sm text-gray-600">
                  Telefone
                </label>
                <input
                  className="w-full bg-white px-2 py-1 rounded-lg"
                  type="text"
                  id="phone"
                  defaultValue="(11) 99999-9999"
                ></input>
              </div>
              <div className="flex flex-col justify-center items-start gap-1">
                <label htmlFor="password" className="text-sm text-gray-600">
                  Senha
                </label>
                <input
                  className="w-full bg-white px-2 py-1 rounded-lg"
                  type="text"
                  id="password"
                  defaultValue="••••••••"
                ></input>
              </div>
              <Button className="w-full mt-2 text-white">Alterar</Button>
              <div
                onClick={() => setConfigAccount(false)}
                className="absolute top-4 right-4 p-2 overflow-hidden rounded-full cursor-pointer flex justify-center items-center hover:bg-main-pink hover:text-white"
              >
                <Minimize2 className="w-6 h-6"></Minimize2>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
