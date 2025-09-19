"use client";
import {
  Ban,
  CheckCircle,
  ChevronDown,
  CircleAlert,
  CircleEllipsis,
  Crown,
  Home,
  SidebarOpen,
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
import { UserPayments } from "@/app/api/auth/perfil/pagamentos/route";
import { useRouter } from "next/navigation";

export default function HistoricoDePagamentos() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [openMenu, setOpenMenu] = useState<boolean>(false);
  const [detailsPlan, setDetailsPlan] = useState<boolean>(false);
  const [userPayments, setUserPayments] = useState<UserPayments[]>([]);
  const [section, setSection] = useState<"pagamentos" | "reembolsos">(
    "pagamentos"
  );

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
        router.replace("/signin?redirect=/perfil");
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
        setTimeout(() => router.replace("/signin?redirect=/perfil"), 1000);
        return;
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Não foi possível encontrar sessão ativa", error);
      setIsLoading(false);
      setTimeout(() => router.replace("/signin?redirect=/perfil"), 3000);
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

  const refunds = userPayments.filter((payment) => payment.refund_at);

  return (
    <>
      <Header />
      <main className="w-full min-h-screen pb-20 flex justify-center items-start">
        <NavigationProfile open={openMenu} onClose={() => setOpenMenu(false)} />
        <article className="relative w-full lg:w-[80%] h-auto flex flex-col justify-start items-start gap-8 pt-24 lg:pt-12 px-6">
          <div
            className="lg:hidden absolute top-4 left-4 flex justify-center items-center p-2 cursor-pointer hover:bg-main-pink hover:text-white rounded-full lg:hidden"
            onClick={() => setOpenMenu(!openMenu)}
          >
            <SidebarOpen className="w-7 h-7"></SidebarOpen>
          </div>
          <div className="flex justify-center md:justify-start items-center gap-3">
            <span className="text-xl font-semibold py-1 text-center md:text-start md:pr-4 border-r border-black/20">
              Histórico
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
                Histórico
              </span>
              <span className="text-gray-500">-</span>
              <span className="text-gray-500 text-sm hover:text-main-purple">
                Histórico de {section}
              </span>
            </span>
          </div>
          <div className="flex flex-col justify-center items-start w-full bg-white border border-black/30 rounded-md pt-4 overflow-hidden">
            <div className="flex justify-start items-center border-b border-black/20 w-full">
              <span
                onClick={() => setSection("pagamentos")}
                className={`${
                  section === "pagamentos"
                    ? "border-b-2 border-main-pink text-main-pink font-semibold"
                    : ""
                } relative px-4 py-2 cursor-pointer rounded-sm text-center md:text-start
									hover:text-main-pink hover:bg-gray-200 transition-all duration-300
									after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-main-pink 
									after:transition-all after:duration-500
									hover:after:w-full`}
              >
                Histórico de pagamentos
              </span>
              <span
                onClick={() => setSection("reembolsos")}
                className={`
									relative px-4 py-2 cursor-pointer rounded-sm text-center md:text-start
									hover:text-main-pink hover:bg-gray-200 transition-all duration-300
									after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-main-pink 
									after:transition-all after:duration-500
									hover:after:w-full
                  ${
                    section === "reembolsos"
                      ? "border-b-2 border-main-pink text-main-pink font-semibold"
                      : ""
                  }
								`}
              >
                Histórico de reembolsos
              </span>
            </div>
            <div className="w-full pt-8 flex justify-center items-center flex-col">
              {section === "pagamentos" && (
                <>
                  {userPayments.length > 0 ? (
                    userPayments.map((payments, index) => (
                      <div
                        className="w-full py-3 px-4 flex flex-col justify-center items-center"
                        key={index}
                      >
                        <div className="w-full pb-3 flex justify-center items-center border-b border-black/20">
                          <ul className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 items-start gap-8">
                            <li className="flex justify-start items-center">
                              <div className="flex flex-col justify-center items-start gap-1">
                                <span className="text-gray-600 text-sm">
                                  ID da transação
                                </span>
                                <span className="text-black text-sm break-all">
                                  {payments.transaction_id}
                                </span>
                              </div>
                            </li>
                            {payments.subscription_id && (
                              <li className="flex justify-center items-center">
                                <div className="flex flex-col justify-center items-start gap-1">
                                  <span className="text-gray-600 text-sm">
                                    ID da Assinatura
                                  </span>
                                  <span className="text-black text-sm break-all">
                                    {payments.subscription_id}
                                  </span>
                                </div>
                              </li>
                            )}
                            <li className="flex justify-center items-center">
                              <div className="flex flex-col justify-center items-start gap-1">
                                <span className="text-gray-600 text-sm">
                                  Tipo
                                </span>
                                <span className="text-black text-sm break-all">
                                  {payments.type === "monthly_fee"
                                    ? "Mensal"
                                    : "Anual"}
                                </span>
                              </div>
                            </li>
                            <li className="flex justify-center items-center">
                              <div className="flex flex-col justify-center items-start gap-1">
                                <span className="text-gray-600 text-sm">
                                  Método
                                </span>
                                <span className="text-black text-sm break-all">
                                  {payments.payment_method === "credit_card"
                                    ? "Cartão de Crédito"
                                    : "PIX"}
                                </span>
                              </div>
                            </li>
                            {payments.status === "paid" ? (
                              <li className="flex justify-center items-center">
                                <div className="flex flex-col justify-center items-start gap-1">
                                  <span className="text-gray-600 text-sm">
                                    Pago em
                                  </span>
                                  <span className="text-black text-sm break-all">
                                    {formatDate(payments.paid_at)}
                                  </span>
                                </div>
                              </li>
                            ) : (
                              <li className="flex justify-center items-center">
                                <div className="flex flex-col justify-center items-start gap-1">
                                  <span className="text-gray-600 text-sm">
                                    Status
                                  </span>
                                  <span className="text-black text-sm break-all">
                                    {payments.status}
                                  </span>
                                </div>
                              </li>
                            )}
                            <li className="flex justify-center items-center">
                              <div className="flex flex-col justify-center items-start gap-1">
                                <span className="text-gray-600 text-sm">
                                  Valor
                                </span>
                                <span className="text-black text-sm break-all">
                                  {formatPrice(
                                    payments.price == "5819"
                                      ? 58.19
                                      : 48.19 * 12
                                  )}
                                </span>
                              </div>
                            </li>
                          </ul>
                        </div>
                        <div className="w-full flex flex-col justify-center items-center py-6">
                          <div className="flex flex-col justify-center items-center gap-6 py-10">
                            <div className="flex flex-col justify-center items-center gap-4">
                              <Crown className="w-10 h-10 text-main-pink"></Crown>
                              <span className="text-gray-800 font-semibold text-center">
                                Precisa solicitar um reembolso?
                              </span>
                            </div>
                            <a
                              href="https://wa.me/5511984349772"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 text-white bg-main-purple font-bold rounded hover:bg-main-pink transition cursor-pointer"
                            >
                              Entrar em contato
                            </a>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col justify-center items-center gap-6 py-10">
                      <div className="flex flex-col justify-center items-center gap-4">
                        <Crown className="w-10 h-10 text-main-pink"></Crown>
                        <span className="text-gray-800 font-semibold text-center">
                          No momento você não possuí nenhum pagamento.
                        </span>
                      </div>
                      <Link
                        href="/#planos"
                        className="px-4 py-2 text-white bg-main-purple font-bold rounded hover:bg-main-pink transition cursor-pointer"
                      >
                        Adquirir primeiro plano
                      </Link>
                    </div>
                  )}
                </>
              )}
              {section === "reembolsos" && (
                <>
                  {refunds.length > 0 ? (
                    refunds.map((payments, index) => (
                      <div
                        key={index}
                        className="w-full flex justify-center items-center py-3 px-4 border-b border-black/20"
                      >
                        <ul className="w-full grid grid-cols-7 items-start gap-8">
                          <li className="flex justify-start items-center">
                            <div className="flex flex-col justify-center items-start gap-1">
                              <span className="text-gray-600 text-sm">
                                ID da transação
                              </span>
                              <span className="text-black text-sm break-all">
                                {payments.transaction_id}
                              </span>
                            </div>
                          </li>
                        </ul>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col justify-center items-center gap-6 py-10">
                      <div className="flex flex-col justify-center items-center gap-4">
                        <Crown className="w-10 h-10 text-main-pink"></Crown>
                        <span className="text-gray-800 font-semibold text-center">
                          No momento você não possuí nenhum reembolso.
                        </span>
                      </div>
                      <Link
                        href="/#planos"
                        className="px-4 py-2 text-white bg-main-purple font-bold rounded hover:bg-main-pink transition cursor-pointer"
                      >
                        Adquirir primeiro plano
                      </Link>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
