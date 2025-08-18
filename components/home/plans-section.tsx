import { Check, Star } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { plans } from "../../lib/plans";
import { formatPrice } from "../../lib/plans";

export function PlansHome() {
  return (
    <article className="w-full py-32" id="planos">
      <section className="w-full container mx-auto grid grid-cols-1 gap-10 items-start justify-center px-4 md:px-0">
        <div className="mx-auto text-center flex justify-center items-center flex-col space-y-4 ">
          <h2 className="text-3xl md:text-4xl font-bold">
            Escolha o plano ideal para seus agendamentos
          </h2>
          <h3 className="text-xl max-w-2xl text-gray-700">
            Todos os planos incluem acesso completo ao sistema, suporte técnico
            e atualizações gratuitas
          </h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-4 container">
          {plans.map((plan) => (
            <div
              key={plan.type}
              className={`w-full max-w-lg mx-auto relative border ${
                plan.popular === true ? "border-main-purple" : "border-gray-400"
              } rounded-xl shadow-lg p-8 flex flex-col justify-center items-start gap-12`}
            >
              {plan.popular === true && (
                <div className="absolute -top-3 right-0 left-0 mx-auto bg-main-purple gap-1 text-center text-white flex justify-center items-center font-bold max-w-42 text-sm rounded-full">
                  <Star className="w-4 h-4"></Star>
                  Mais Popular
                </div>
              )}
              <div className="w-full flex justify-center items-center flex-col space-y-2">
                <span className="text-2xl font-bold">{plan.type}</span>
                <div className="flex items-end justify-center gap-1">
                  <span className="line-through text-red-600">
                    De {formatPrice(plan.pricePrevious)} por
                  </span>
                </div>
                <div className="flex items-end justify-center gap-1">
                  <span className="text-3xl font-bold">
                    {formatPrice(plan.price)}
                  </span>
                  {plan.type === "Mensal" && (
                    <span className="text-gray-700">/mês</span>
                  )}
                  {plan.type === "Anual" && (
                    <span className="text-gray-700">x 12 meses</span>
                  )}
                </div>
                {plan.type === "Anual" && (
                  <div className="flex items-end justify-center">
                    <span className="text-gray-700">
                      ou {formatPrice(plan.price * 12)} à vista
                    </span>
                  </div>
                )}
                <div>
                  {plan.type === "Mensal" && (
                    <span className="text-gray-700">Perfeito para começar</span>
                  )}
                  {plan.type === "Anual" && (
                    <div>
                      <span className="line-through text-gray-600 text-base">
                        R$ 58,19
                      </span>{" "}
                      <span className="text-base font-bold text-green-600">
                        Economize R$ 119,99/ano
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <ul className="flex flex-col justify-start items-start gap-2">
                  {plan.features.map((features, index) => (
                    <li
                      key={index}
                      className="flex justify-start items-center gap-2 text-md font-medium text-gray-700"
                    >
                      <Check className="w-5 h-5 text-green-600"></Check>
                      {features}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-full">
                <Link href={`/checkout?plan=${plan.link}`}>
                  <Button
                    className={`w-full ${
                      plan.type === "Mensal"
                        ? "bg-sub-background hover:text-white"
                        : ""
                    } ${plan.type === "Anual" ? "text-white" : ""}`}
                  >
                    Adquirir Plano {plan.type === "Anual" ? "Anual" : "Mensal"}
                  </Button>
                </Link>
                <div className="w-full text-center mt-4">
                  <span className="text-gray-600 text-md">
                    Sem taxa de instalação
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center flex flex-col justify-center items-center gap-4">
          <span className="text-md text-gray-700">
            Precisa de um plano personalizado para sua rede de agendamentos?
          </span>
          <Button className="bg-white border border-gray-300 shadow-xl hover:text-white">
            Falar com Especialista
          </Button>
        </div>
      </section>
    </article>
  );
}
