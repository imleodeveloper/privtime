"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Footer } from "../../../components/footer";
import { Header } from "../../../components/header";
import { formatPrice, plans } from "../../../lib/plans";
import React, { useState, useEffect } from "react";
import { CreditCard, PanelTopOpen, Star } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { supabase } from "../../../lib/supabase";
import Link from "next/link";

interface FaqQuestions {
  question: string;
  answer: string;
}

const faqQuestions: FaqQuestions[] = [
  {
    question: "Como posso alterar o plano antes de finalizar a compra?",
    answer:
      "Você pode selecionar outro plano diretamente na página de checkout ou voltar à página de planos para escolher uma nova opção. Assim que selecionar, o resumo do pedido será atualizado automaticamente.",
  },
  {
    question: "Quais métodos de pagamento vocês aceitam?",
    answer:
      "Aceitamos cartões de crédito, PIX e pagamentos recorrentes via assinatura. Todas as transações são processadas de forma 100% segura.",
  },
  {
    question: "Minha assinatura é renovada automaticamente?",
    answer:
      "Sim, as assinaturas mensais e anuais são renovadas automaticamente ao final do período contratado. Você pode cancelar a renovação a qualquer momento pelo painel do usuário.",
  },
  {
    question: "Minhas informações de pagamento estão seguras?",
    answer:
      "Sim, utilizamos gateways de pagamento confiáveis e certificados (do Mercado Pago) que garantem a segurança de todos os dados transacionados.",
  },
  {
    question: "Receberei acesso imediato após o pagamento?",
    answer:
      "Pagamentos com cartão de crédito e PIX têm confirmação instantânea.",
  },
  {
    question: "Posso cancelar minha assinatura e obter reembolso?",
    answer:
      "Você pode cancelar a qualquer momento. Se o cancelamento for solicitado em até 7 dias após a compra, oferecemos reembolso integral, conforme o Código de Defesa do Consumidor.",
  },
];

interface CustomerData {
  id: string;
  email: string;
  name: string;
  phone: string;
  identity: string;
}

interface FetchProfile {
  full_name: string;
  phone: string;
  email: string;
  identity: string;
}

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  //const planURL = searchParams.get("plan"); //Pega o plan da URL ex: https://privtime.com.br/checkout?plan=monthly_plan
  const [planURL, setPlanURL] = useState<string | null>(null);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [changePlan, setChangePlan] = useState(false);
  const [userData, setUserData] = useState<CustomerData>({
    id: "",
    email: "",
    name: "",
    phone: "",
    identity: "",
  });
  const [fetchProfile, setFetchProfile] = useState<FetchProfile>({
    full_name: "",
    email: "",
    phone: "",
    identity: "",
  });

  // Qual plano foi selecionado
  const [selectedPlan, setSelectedPlan] = useState<(typeof plans)[0] | null>(
    null
  );

  useEffect(() => {
    setPlanURL(searchParams.get("plan"));
  }, [searchParams]);

  useEffect(() => {
    if (!planURL) {
      const currentURL = window.location.pathname + window.location.search;
      router.push(`/?redirect=${encodeURIComponent(currentURL)}`);
      return;
    }

    if (planURL) {
      const plan = plans.find((p) => p.link === planURL);
      setSelectedPlan(plan || null);
    }
  }, [planURL]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          // Redireciona para o login se não tiver sessão logada
          const currentURL = window.location.pathname + window.location.search;
          router.push(`/signin?redirect=${encodeURIComponent(currentURL)}`);
          return;
        }

        if (session.user) {
          setUserData((prev) => ({
            ...prev,
            id: session.user.id,
            email: session.user.email || "",
            name: session.user.user_metadata?.full_name || "",
            phone: session.user.user_metadata?.phone || "",
            identity: session.user.user_metadata?.identity || "",
          }));

          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (error) {
            console.log("Não foi possível localizar as informações do usuário");
          }

          if (data) {
            setFetchProfile({
              full_name: data.full_name,
              email: data.email,
              phone: data.phone,
              identity: data.identity,
            });
          }
        }
      } catch (error) {
        console.error(
          "Erro ao verificar sessão ou localizar informações do usuário: ",
          error
        );
      }
    };

    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (fetchProfile && selectedPlan) {
      try {
        const response = await fetch("/api/picpay/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile: fetchProfile, plan: selectedPlan }),
        });
      } catch (error) {}
    }
  };

  return (
    <div className="w-full">
      <Header />
      <main className="w-full py-14 relative">
        {selectedPlan ? (
          <article className="w-full container mx-auto min-h-auto gap-12 grid grid-cols-1 px-4 lg:px-0 lg:grid-cols-[1fr_1fr_1fr] items-start">
            <div className="flex flex-col justify-start items-start gap-8">
              <h1 className="text-4xl font-extrabold text-main-pink">
                Plano Selecionado:
              </h1>
              <h2 className="text-2xl font-semibold text-black">
                Software de Agendamento - {selectedPlan.type}
              </h2>
              <div className="flex justify-start items-start flex-col gap-1">
                <span className="text-xl font-semibold text-gray-800">
                  Valor:{" "}
                </span>
                <span className="text-4xl font-extrabold text-main-pink flex justify-start items-end gap-2">
                  {formatPrice(
                    selectedPlan.type === "Anual"
                      ? selectedPlan.price * 12
                      : selectedPlan.price
                  )}
                  {selectedPlan.type === "Mensal" && (
                    <span className="text-xl font-medium text-gray-700">
                      /mês
                    </span>
                  )}
                </span>
              </div>

              <div className="flex flex-col justify-start items-start">
                {selectedPlan.features.map((features, index) => (
                  <ul
                    className="flex flex-col justify-start items-start"
                    key={index}
                  >
                    <li className="flex justify-start items-center gap-1 text-gray-700 text-base">
                      <Star className="w-4 h-4 text-yellow-600"></Star>{" "}
                      {features}
                    </li>
                  </ul>
                ))}
              </div>
              <div className="w-full flex justify-center items-center flex-col bg-sub-background rounded-md overflow-hidden">
                <Button
                  onClick={() => setChangePlan(!changePlan)}
                  className="group w-full text-center bg-sub-background flex justify-center items-center gap-2 hover:text-white"
                >
                  Alterar Plano
                  <PanelTopOpen className="w-4 h-4 text-black group-hover:text-white transition-all duration-200"></PanelTopOpen>
                </Button>

                <Link
                  href={`/checkout?plan=${
                    selectedPlan.type === "Mensal"
                      ? "annual_plan"
                      : "monthly_plan"
                  }`}
                  className={`cursor-pointer transition-all duration-300 overflow-hidden w-full border border-sub-background rounded-md bg-main-purple text-white font-bold hover:bg-main-pink flex justify-center items-center ${
                    changePlan ? "mt-2 max-h-96 py-2" : "py-0 mt-0 max-h-0"
                  }`}
                >
                  <span>
                    {selectedPlan.type === "Mensal"
                      ? "Plano Anual"
                      : "Plano Mensal"}
                  </span>
                </Link>
              </div>
            </div>

            <div className="relative flex justify-center items-start">
              {/*<div className="absolute top-0 left-0 right-0 mx-auto w-140 h-140 rounded-full bg-main-pink opacity-45 -z-1"></div>*/}
              <div className="w-96 h-140 bg-main-purple rounded-2xl flex flex-col justify-center items-center p-4">
                <form
                  className="w-full flex flex-col justify-center items-start text-white"
                  onSubmit={handleSubmit}
                >
                  <div className="w-full flex flex-col justify-start items-start gap-4">
                    <span className="text-xl font-bold">Resumo do pedido</span>

                    {selectedPlan.type === "Mensal" && (
                      <div className="w-full flex flex-col justify-start items-start">
                        <ul className="w-full flex flex-col justify-start items-start">
                          <div className="w-full">
                            <li className="w-full flex justify-between items-center text-base">
                              <span className="text-lg font-medium">
                                SaaS - Mensal
                              </span>
                              <span className="text-gray-400 line-through">
                                {formatPrice(selectedPlan.pricePrevious)} /mês
                              </span>
                            </li>
                            <li className="w-full flex justify-between items-center text-base">
                              <span className="text-lg font-medium">
                                Subtotal
                              </span>
                              <span className="text-green-400">
                                {formatPrice(selectedPlan.price)} /mês
                              </span>
                            </li>
                          </div>
                        </ul>
                      </div>
                    )}
                    {selectedPlan.type === "Anual" && (
                      <div className="w-full flex flex-col justify-start items-start">
                        <ul className="w-full flex flex-col justify-start items-start">
                          <div className="w-full">
                            <li className="w-full flex justify-between items-center text-base">
                              <span className="text-lg font-medium">
                                SaaS - Anual
                              </span>
                              <span className="text-gray-400 line-through">
                                {formatPrice(selectedPlan.pricePrevious * 12)}
                              </span>
                            </li>
                            <li className="w-full flex justify-between items-center text-base">
                              <span className="text-lg font-medium">
                                Subtotal
                              </span>
                              <span className="text-green-400">
                                {formatPrice(selectedPlan.price * 12)}
                              </span>
                            </li>
                          </div>
                        </ul>
                      </div>
                    )}
                    <span className="text-xl font-bold">
                      Informe seus dados:{" "}
                    </span>
                    {fetchProfile ? (
                      <div className="w-full flex flex-col justify-start items-start gap-2">
                        <div className="w-full flex flex-col justify-center items-start">
                          <label>Nome Completo</label>
                          <Input
                            placeholder="Digite seu nome"
                            type="text"
                            className="text-black text-sm py-2"
                            value={fetchProfile.full_name}
                            onChange={(e) =>
                              setFetchProfile({
                                ...fetchProfile,
                                full_name: e.target.value,
                              })
                            }
                          ></Input>
                        </div>
                        <div className="w-full flex flex-col justify-center items-start">
                          <label>E-mail</label>
                          <Input
                            placeholder="Digite seu e-mail"
                            type="email"
                            className="text-black text-sm py-2"
                            value={fetchProfile.email}
                            onChange={(e) =>
                              setFetchProfile({
                                ...fetchProfile,
                                email: e.target.value,
                              })
                            }
                          ></Input>
                        </div>
                        <div className="w-full flex flex-col justify-center items-start">
                          <label>Telefone</label>
                          <Input
                            placeholder="Digite seu telefone"
                            type="tel"
                            className="text-black text-sm py-2"
                            value={fetchProfile.phone}
                            onChange={(e) =>
                              setFetchProfile({
                                ...fetchProfile,
                                phone: e.target.value,
                              })
                            }
                          ></Input>
                        </div>
                        <div className="w-full flex flex-col justify-center items-start">
                          <label>CPF</label>
                          <Input
                            placeholder="Digite seu CPF"
                            type="number"
                            className="text-black text-sm py-2"
                            value={fetchProfile.identity}
                            onChange={(e) =>
                              setFetchProfile({
                                ...fetchProfile,
                                identity: e.target.value,
                              })
                            }
                          ></Input>
                        </div>
                        <div className="w-full flex justify-start items-center gap-1 my-2">
                          <input
                            type="checkbox"
                            id="refoundCheck"
                            className="w-auto"
                            required
                          ></input>
                          <label
                            className="w-full text-xs"
                            htmlFor="refoundCheck"
                          >
                            Confirmo que li e concordo com a{" "}
                            <Link
                              href="/politica-de-reembolso"
                              className="text-blue-400 hover:text-blue-600"
                            >
                              Política de Reembolso
                            </Link>
                            .
                          </label>
                        </div>
                        <div className="w-full flex flex-col justify-center items-start mt-2">
                          <Button
                            type="submit"
                            className="group w-full bg-sub-background text-black hover:text-white flex justify-center items-center gap-2"
                          >
                            Continuar
                            <CreditCard className="w-5 h-5 text-black group-hover:text-white transition-all duration-200"></CreditCard>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full flex flex-col justify-start items-start gap-2">
                        <div className="w-full flex flex-col justify-center items-start">
                          <label>Nome Completo</label>
                          <Input
                            placeholder="Digite seu nome"
                            type="text"
                            className="text-black"
                          ></Input>
                        </div>
                        <div className="w-full flex flex-col justify-center items-start">
                          <label>E-mail</label>
                          <Input
                            placeholder="Digite seu e-mail"
                            type="email"
                            className="text-black"
                          ></Input>
                        </div>
                        <div className="w-full flex flex-col justify-center items-start">
                          <label>Telefone</label>
                          <Input
                            placeholder="Digite seu telefone"
                            type="tel"
                            className="text-black"
                          ></Input>
                        </div>
                        <div className="w-full flex flex-col justify-center items-start">
                          <label>CPF</label>
                          <Input
                            placeholder="Digite seu CPF"
                            type="number"
                            className="text-black"
                          ></Input>
                        </div>
                        <div className="w-full flex justify-start items-center gap-1">
                          <label>
                            Confirmo que li e concordo com a{" "}
                            <Link href="/politica-de-reembolso">
                              Política de Reembolso
                            </Link>
                            .
                          </label>
                          <Input type="checkout"></Input>
                        </div>
                        <div className="w-full flex flex-col justify-center items-start mt-2">
                          <Button
                            type="submit"
                            className="group w-full bg-sub-background text-black hover:text-white flex justify-center items-center gap-2"
                          >
                            Continuar
                            <CreditCard className="w-5 h-5 text-black group-hover:text-white transition-all duration-200"></CreditCard>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              </div>
            </div>
            <div className="flex justify-center items-start gap-8">
              <div className="w-full flex flex-col justify-center items-center">
                <span className="text-4xl font-extrabold text-main-pink">
                  Perguntas Frequentes:
                </span>
                <div className="w-full flex justify-center items-center gap-2 mt-6 flex-col">
                  {faqQuestions.map((question, index) => (
                    <div
                      key={index}
                      className="w-full flex flex-col justify-center items-center bg-sub-background/50 p-4 rounded-xl shadow-xl"
                    >
                      <div className="flex justify-between items-center w-full relative">
                        <div className="absolute -bottom-1 left-0 right-0 mx-auto width-[90%] h-[1px] bg-gradient-to-r bg-gradient-to-r from-transparent via-main-pink to-transparent"></div>
                        <span className="pr-8 text-sm">
                          {question.question}
                        </span>
                        <PanelTopOpen
                          className="w-[40px] h-[40px] cursor-pointer p-1 hover:bg-main-pink hover:text-white transition-all duration-300 rounded-full"
                          onClick={() =>
                            setFaqOpen(faqOpen === index ? null : index)
                          }
                        ></PanelTopOpen>
                      </div>
                      <div
                        className={`transition-all duration-400 overflow-hidden flex justify-center items-start ${
                          faqOpen === index ? "pt-4 max-h-96" : "pt-0 max-h-0"
                        } `}
                      >
                        <span className="text-sm">{question.answer}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ) : (
          <div className="">Não encontrado</div>
        )}
      </main>
      <Footer />
    </div>
  );
}
