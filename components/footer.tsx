import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full bg-sub-background h-auto lg:px-8 pt-12">
      <div className="w-full container border-b border-gray-400 grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-4 lg:gap-0 px-4 lg:px-0 mx-auto pb-8">
        <div className="flex flex-col justify-start items-start gap-4">
          <div className="flex justify-start items-center gap-4">
            <Image src="/privetime-users.png" alt="" width={80} height={80} />
            <span className="font-bold text-2xl text-main-pink">PriveTime</span>
          </div>
          <div className="max-w-sm">
            <span className="text-gray-800">
              Sistema completo para gestão de agendamentos. Desenvolvido pela
              VierCa Tech com tecnologia de ponta.
            </span>
          </div>
          <div className="flex justify-start items-center gap-2">
            <Facebook className="w-5 h-5 text-gray-800"></Facebook>
            <Instagram className="w-5 h-5 text-gray-800"></Instagram>
            <Twitter className="w-5 h-5 text-gray-800"></Twitter>
            <Youtube className="w-5 h-5 text-gray-800"></Youtube>
          </div>
        </div>
        <div className="flex flex-col justify-start items-start gap-4">
          <h2 className="font-bold text-xl text-main-pink">Links Rápidos</h2>
          <ul className="flex flex-col justify-start items-start gap-2">
            <li className="cursor-pointer text-gray-700 hover:text-main-purple">
              <Link href="/">Início</Link>
            </li>
            <li className="cursor-pointer text-gray-700 hover:text-main-purple">
              <Link href="/#planos">Planos</Link>
            </li>
            {/*
            <li className="cursor-pointer text-gray-700 hover:text-main-purple">
              <Link href="">Feedbacks</Link>
            </li> 
             */}
            <li className="cursor-pointer text-gray-700 hover:text-main-purple">
              <Link href="/#sobre">Sobre</Link>
            </li>
          </ul>
        </div>
        <div className="flex flex-col justify-start items-start gap-4">
          <h2 className="font-bold text-xl text-main-pink">Suporte</h2>
          <ul className="flex flex-col justify-start items-start gap-2">
            <li className="cursor-pointer text-gray-700 hover:text-main-purple">
              <Link
                href="https://wa.me/5511963646461"
                target="_blank"
                rel="noopener noreferrer"
              >
                WhatsApp
              </Link>
            </li>
            <li className="cursor-pointer text-gray-700 hover:text-main-purple">
              <Link
                href="https://www.viamodels.com.br/"
                target="_blank"
                rel="noopener noreferrer"
              >
                ViaModels
              </Link>
            </li>
          </ul>
        </div>
        <div className="flex flex-col justify-start items-start gap-4">
          <h2 className="font-bold text-xl text-main-pink">Links Úteis</h2>
          <ul className="flex flex-col justify-start items-start gap-2">
            <li className="cursor-pointer text-gray-700 hover:text-main-purple">
              <Link href="/politica-de-privacidade">
                Política de Privacidade
              </Link>
            </li>
            <li className="cursor-pointer text-gray-700 hover:text-main-purple">
              <Link href="/politica-de-reembolso">Política de Reembolso</Link>
            </li>
            <li className="cursor-pointer text-gray-700 hover:text-main-purple">
              <Link href="/termos-de-uso">Termos de Uso</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="mx-auto container w-full flex flex-col gap-4 lg:gap-0 lg:flex-row justify-between items-center py-8">
        <small className="text-gray-700 text-sm">
          © 2025 PriveTime. Todos os direitos reservados.
        </small>
        <span className="text-gray-700 text-sm">
          Desenvolvido por{" "}
          <Link
            href="https://www.viercatech.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            VierCa Tech
          </Link>
        </span>
      </div>
    </footer>
  );
}
