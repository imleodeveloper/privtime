import { Briefcase } from "lucide-react";

export default function AboutHome() {
  return (
    <article className="w-full pt-24 container mx-auto">
      <section className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 lg:px-0">
        <div className="flex flex-col justify-start items-start gap-8">
          <h2 className="text-3xl md:text-4xl font-bold">
            Conheça a ViaModels
          </h2>
          <div className="space-y-4 text-md text-gray-700">
            <p>
              A ViaModels é uma agência especializada em modelos de alto padrão,
              oferecendo profissionais qualificados para campanhas
              publicitárias, eventos corporativos, feiras, lançamentos de
              produtos e produções de moda.
            </p>
            <p>
              Com foco em excelência, elegância e profissionalismo, trabalhamos
              com um portfólio diversificado de modelos preparados para
              representar marcas com sofisticação e credibilidade.
            </p>
            <p>
              Nossa missão é conectar empresas e marcas a talentos que agregam
              valor e impacto visual às suas campanhas e eventos, proporcionando
              experiências únicas e resultados memoráveis.
            </p>
            <p>
              Na ViaModels, unimos beleza, presença e profissionalismo para
              transformar cada projeto em um grande sucesso.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="shadow-md flex flex-col justify-center items-center gap-4 p-4 text-center rounded-xl">
            <Briefcase className="w-7 h-7 text-main-purple"></Briefcase>
            <h3 className="text-2xl font-bold">Lorem ipsum</h3>
            <p className="text-base text-gray-700">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Reiciendis laboriosam iste labore nesciunt
            </p>
          </div>
          <div className="shadow-md flex flex-col justify-center items-center gap-4 p-4 text-center rounded-xl">
            <Briefcase className="w-7 h-7 text-main-purple"></Briefcase>
            <h3 className="text-2xl font-bold">Lorem ipsum</h3>
            <p className="text-base text-gray-700">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Reiciendis laboriosam iste labore nesciunt
            </p>
          </div>
          <div className="shadow-md flex flex-col justify-center items-center gap-4 p-4 text-center rounded-xl">
            <Briefcase className="w-7 h-7 text-main-purple"></Briefcase>
            <h3 className="text-2xl font-bold">Lorem ipsum</h3>
            <p className="text-base text-gray-700">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Reiciendis laboriosam iste labore nesciunt
            </p>
          </div>
          <div className="shadow-md flex flex-col justify-center items-center gap-4 p-4 text-center rounded-xl">
            <Briefcase className="w-7 h-7 text-main-purple"></Briefcase>
            <h3 className="text-2xl font-bold">Lorem ipsum</h3>
            <p className="text-base text-gray-700">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Reiciendis laboriosam iste labore nesciunt
            </p>
          </div>
        </div>
      </section>
    </article>
  );
}
