import {
  BarChart3,
  Briefcase,
  CalendarClock,
  Headset,
  UserPlus,
} from "lucide-react";

export default function AboutHome() {
  return (
    <article className="w-full pt-24 container mx-auto" id="via-models">
      <section className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 lg:px-0">
        <div className="flex flex-col justify-start items-start gap-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            Conheça o PriveTime
          </h2>
          <div className="space-y-4 text-md text-gray-700">
            <p>
              O PriveTime é um aplicativo desenvolvido pela ViaModels, criado
              para otimizar e organizar agendamentos de profissionais do
              entretenimento adulto com eficiência, discrição e segurança.
            </p>
            <p>
              Voltado para a gestão de horários, cadastro de clientes e controle
              de atendimentos, o app oferece relatórios mensais detalhados e
              recursos que facilitam o dia a dia dos usuários. Com uma interface
              simples e intuitiva, o PriveTime é constantemente atualizado,
              garantindo performance e estabilidade.
            </p>
            <p>
              Nosso suporte está sempre disponível para auxiliar e resolver
              qualquer necessidade com rapidez e profissionalismo.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="shadow-md flex flex-col justify-center items-center gap-4 p-4 text-center rounded-xl">
            <CalendarClock className="w-7 h-7 text-main-purple"></CalendarClock>
            <h3 className="text-xl font-bold">
              Gestão de Agendamentos Inteligente
            </h3>
            <p className="text-base text-gray-700">
              Organize horários e compromissos com rapidez e eficiência.
            </p>
          </div>
          <div className="shadow-md flex flex-col justify-center items-center gap-4 p-4 text-center rounded-xl">
            <BarChart3 className="w-7 h-7 text-main-purple"></BarChart3>
            <h3 className="text-xl font-bold">Relatórios Detalhados</h3>
            <p className="text-base text-gray-700">
              Acompanhe desempenho mensal e resultados de forma clara.
            </p>
          </div>
          <div className="shadow-md flex flex-col justify-center items-center gap-4 p-4 text-center rounded-xl">
            <UserPlus className="w-7 h-7 text-main-purple"></UserPlus>
            <h3 className="text-xl font-bold">
              Cadastro de Profissionais Simplificado
            </h3>
            <p className="text-base text-gray-700">
              Gerencie perfis e informações em poucos cliques.
            </p>
          </div>
          <div className="shadow-md flex flex-col justify-center items-center gap-4 p-4 text-center rounded-xl">
            <Headset className="w-7 h-7 text-main-purple"></Headset>
            <h3 className="text-xl font-bold">
              Suporte e Atualizações Constantes
            </h3>
            <p className="text-base text-gray-700">
              Sempre prontos para atender e melhorar sua experiência.
            </p>
          </div>
        </div>
      </section>
    </article>
  );
}
