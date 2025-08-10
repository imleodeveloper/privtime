import { Check, CheckCheck, CircleCheckBig, Play } from "lucide-react";
import { Button } from "../ui/button";
import Image from "next/image";
import Link from "next/link";

export function HeroHome() {
  return (
    <article className="w-full" id="inicio">
      <section className="w-full px-4 lg:px-0 container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="w-full min-h-auto bg-black-600 space-y-6">
          <h1 className="text-3xl md:text-5xl font-bold text-foreground">
            Tudo o que você precisa para ter seu{" "}
            <span className="text-main-purple">App de Agendamento</span>{" "}
            funcionando
          </h1>
          <div className="flex flex-col justify-start items-start">
            <span className="text-red-600 line-through">De R$ 116,58 por</span>
            <span className="text-black/70 font-medium text-lg">
              A partir de:
            </span>
            <h2 className="text-3xl font-extrabold text-main-purple">
              R$ 48,19/mês
            </h2>
          </div>
          <div className="space-x-4 flex flex-col lg:flex-row justify-start items-start gap-2">
            <Link href="/#planos">
              <Button className="text-white w-full lg:w-auto">
                Ver Planos
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-sub-purple w-full lg:w-auto hover:text-white">
                Experimente por 7 dias gratuitos
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <span className="flex justify-start items-center gap-2 text-base text-foreground">
              <CircleCheckBig className="text-md text-green-600"></CircleCheckBig>
              Interface intuitiva e moderna
            </span>
            <span className="flex justify-start items-center gap-2 text-base text-foreground">
              <CircleCheckBig className="text-md text-green-600"></CircleCheckBig>
              Relatórios financeiros mensais detalhados
            </span>
            <span className="flex justify-start items-center gap-2 text-base text-foreground">
              <CircleCheckBig className="text-md text-green-600"></CircleCheckBig>
              Suporte técnico incluso
            </span>
            <span className="flex justify-start items-center gap-2 text-base text-foreground">
              <CircleCheckBig className="text-md text-green-600"></CircleCheckBig>
              Gestão completa de agendamentos
            </span>
            <span className="flex justify-start items-center gap-2 text-base text-foreground">
              <CircleCheckBig className="text-md text-green-600"></CircleCheckBig>
              App web mobile para clientes
            </span>
          </div>
        </div>
        <div className="w-full">
          <div className="bg-gradient-to-r from-main-purple to-sub-purple min-h-96 w-full md:w-4/5 space-y-6 mx-auto rounded-xl p-8">
            <div className="bg-sub-purple w-full h-50 rounded-xl flex flex-col gap-2 justify-center items-center">
              <div className="rounded-full mx-auto bg-main-purple w-16 h-16 opacity-75 flex justify-center items-center">
                <Play className="text-white"></Play>
              </div>
              <span className="text-white text-xl font-bold">
                Veja o PriveTime em ação
              </span>
              <span className="text-white/70 text-md">
                Demonstração completa do sistema
              </span>
            </div>
            <div className="bg-white w-full h-auto rounded-xl p-4">
              <div className="flex justify-start items-start gap-2">
                <span className="rounded-full w-10 h-10 overflow-hidden relative justify-center items-center">
                  <Image src="/privetime-users-bg.png" alt="" fill />
                </span>
                <span className="flex flex-col justify-center items-start">
                  <h3 className="font-bold text-base">PriveTime</h3>
                  <p className="text-gray-700 text-sm">Sistema de Gestão</p>
                </span>
              </div>
              <div className="grid grid-cols-1 w-full pt-2 space-y-2">
                <span className="w-full rounded-lg p-1 gap-2 flex justify-start items-center text-xs text-gray-600 bg-blue-50">
                  <Check className="w-3 h-3"></Check>
                  Agendamento realizado com sucesso
                </span>
                <span className="w-full rounded-lg p-1 gap-2 flex justify-start items-center text-xs text-gray-600 bg-green-50">
                  <Check className="w-3 h-3"></Check>
                  Suporte e atualizações constantes
                </span>
                <span className="w-full rounded-lg p-1 gap-2 flex justify-start items-center text-xs text-gray-600 bg-red-50">
                  <Check className="w-3 h-3"></Check>
                  Relatório financeiro atualizado
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
