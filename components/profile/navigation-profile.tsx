"use client";
import {
  BanknoteArrowDown,
  BriefcaseBusiness,
  Calendar,
  CalendarClock,
  ChartColumn,
  CreditCard,
  House,
  IdCardLanyard,
  Info,
  PanelLeftClose,
  UserRound,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavigationProfile({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav
      className={`fixed overflow-y-auto top-0 left-0 z-10 lg:relative h-full w-1/2 lg:w-[20%] bg-sub-background/40 py-12 lg:pt-2 backdrop-blur-md grid grid-cols-1 gap-1 border-r border-b border-main-pink/40 shadow-sm rounded-br-lg transition-all duration-500 ${
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      <div
        onClick={onClose}
        className="lg:hidden absolute top-2 right-2 flex justify-center items-center p-2 hover:bg-main-pink hover:text-white rounded-full cursor-pointer"
      >
        <PanelLeftClose className="w-6 h-6"></PanelLeftClose>
      </div>
      <ul className="w-full flex justify-start items-center flex-col gap-1 p-2">
        <li
          className={`cursor-pointer flex justify-start items-center w-full gap-2 text-sm ${
            pathname === "/perfil"
              ? "font-bold text-main-pink bg-main-purple/20 rounded-lg"
              : "font-normal hover:bg-main-purple/10 rounded-lg"
          }`}
        >
          <Link
            href="/perfil"
            className="w-full p-3 flex justify-start items-center gap-2"
          >
            <House className="w-5 h-5"></House> Início
          </Link>
        </li>

        <span className="w-full text-start text-main-pink font-bold pl-3 pb-1 mt-4 border-b border-black/20">
          App
        </span>
        <li
          className={`cursor-pointer flex justify-start items-center w-full gap-2 text-sm ${
            pathname === "/perfil/agendamentos"
              ? "font-bold text-main-pink bg-main-purple/20 rounded-lg"
              : "font-normal  hover:bg-main-purple/10 rounded-lg"
          }`}
        >
          <Link
            href="/perfil/agendamentos"
            className="w-full p-3 flex justify-start items-center gap-2"
          >
            <Calendar className="w-5 h-5"></Calendar> Agendamentos
          </Link>
        </li>
        <li
          className={`cursor-pointer flex justify-start items-center w-full gap-2 text-sm ${
            pathname === "/perfil/sua-agenda"
              ? "font-bold text-main-pink bg-main-purple/20 rounded-lg"
              : "font-normal  hover:bg-main-purple/10 rounded-lg"
          }`}
        >
          <Link
            href="/perfil/sua-agenda"
            className="w-full p-3 flex justify-start items-center gap-2"
          >
            <CalendarClock className="w-5 h-5"></CalendarClock> Sua Agenda
          </Link>
        </li>
        <li
          className={`cursor-pointer flex justify-start items-center w-full gap-2 text-sm ${
            pathname === "/perfil/relatorios"
              ? "font-bold text-main-pink bg-main-purple/20 rounded-lg"
              : "font-normal  hover:bg-main-purple/10 rounded-lg"
          }`}
        >
          <Link
            href="/perfil/relatorios"
            className="w-full p-3 flex justify-start items-center gap-2"
          >
            <ChartColumn className="w-5 h-5"></ChartColumn> Relatórios
          </Link>
        </li>
        <li
          className={`cursor-pointer flex justify-start items-center w-full gap-2 text-sm ${
            pathname === "/perfil/profissionais"
              ? "font-bold text-main-pink bg-main-purple/20 rounded-lg"
              : "font-normal  hover:bg-main-purple/10 rounded-lg"
          }`}
        >
          <Link
            href="/perfil/profissionais"
            className="w-full p-3 flex justify-start items-center gap-2"
          >
            <IdCardLanyard className="w-5 h-5"></IdCardLanyard> Profissionais
          </Link>
        </li>
        <li
          className={`cursor-pointer flex justify-start items-center w-full gap-2 text-sm ${
            pathname === "/perfil/servicos"
              ? "font-bold text-main-pink bg-main-purple/20 rounded-lg"
              : "font-normal  hover:bg-main-purple/10 rounded-lg"
          }`}
        >
          <Link
            href="/perfil/servicos"
            className="w-full p-3 flex justify-start items-center gap-2"
          >
            <BriefcaseBusiness className="w-5 h-5"></BriefcaseBusiness> Serviços
          </Link>
        </li>
        {/* <li
          className={`cursor-pointer flex justify-start items-center w-full gap-2 text-sm ${
            pathname === "/perfil/ajuda"
              ? "font-bold text-main-pink bg-main-purple/20 rounded-lg"
              : "font-normal  hover:bg-main-purple/10 rounded-lg"
          }`}
        >
          <Link
            href="/perfil/ajuda"
            className="w-full p-3 flex justify-start items-center gap-2"
          >
            <Info className="w-5 h-5"></Info> Ajuda
          </Link>
        </li> */}
        <span className="w-full text-start text-main-pink font-bold pl-3 pb-1 mt-4 border-b border-black/20">
          Área do Cliente
        </span>
        <li
          className={`cursor-pointer flex justify-start items-center w-full gap-2 text-sm ${
            pathname === "/perfil/assinaturas"
              ? "font-bold text-main-pink bg-main-purple/20 rounded-lg"
              : "font-normal  hover:bg-main-purple/10 rounded-lg"
          }`}
        >
          <Link
            href="/perfil/assinaturas"
            className="w-full p-3 flex justify-start items-center gap-2"
          >
            <CreditCard className="w-5 h-5"></CreditCard> Assinaturas
          </Link>
        </li>
        <li
          className={`cursor-pointer flex justify-start items-center w-full gap-2 text-sm ${
            pathname === "/perfil/historico-de-pagamentos"
              ? "font-bold text-main-pink bg-main-purple/20 rounded-lg"
              : "font-normal  hover:bg-main-purple/10 rounded-lg"
          }`}
        >
          <Link
            href="/perfil/historico-de-pagamentos"
            className="w-full p-3 flex justify-start items-center gap-2"
          >
            <BanknoteArrowDown className="w-5 h-5"></BanknoteArrowDown>{" "}
            Histórico
          </Link>
        </li>
        <li
          className={`cursor-pointer flex justify-start items-center w-full gap-2 text-sm ${
            pathname === "/perfil/informacoes-de-conta"
              ? "font-bold text-main-pink bg-main-purple/20 rounded-lg"
              : "font-normal  hover:bg-main-purple/10 rounded-lg"
          }`}
        >
          <Link
            href="/perfil/informacoes-de-conta"
            className="w-full p-3 flex justify-start items-center gap-2"
          >
            <UserRound className="w-5 h-5"></UserRound> Informações de Conta
          </Link>
        </li>
        <li
          className={`cursor-pointer flex justify-start items-center w-full gap-2 text-sm ${
            pathname === "/perfil/compartilhe-seu-app"
              ? "font-bold text-main-pink bg-main-purple/20 rounded-lg"
              : "font-normal  hover:bg-main-purple/10 rounded-lg"
          }`}
        >
          <Link
            href="/perfil/compartilhe-seu-app"
            className="w-full p-3 flex justify-start items-center gap-2"
          >
            <UsersRound className="w-5 h-5"></UsersRound> Compartilhe seu App
          </Link>
        </li>
      </ul>
    </nav>
  );
}
