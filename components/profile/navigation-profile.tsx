"use client";
import {
  BanknoteArrowDown,
  CreditCard,
  House,
  User,
  UserRound,
  UsersRound,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavigationProfile() {
  const pathname = usePathname();

  return (
    <nav className="h-full w-[20%] bg-sub-background/40 pt-2 grid grid-cols-1 gap-1 border-r border-black/80">
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
            Histórico de Pagamentos
          </Link>
        </li>
        <li
          className={`cursor-pointer flex justify-start items-center w-full gap-2 text-sm ${
            pathname === "/perfil/informacoes-da-conta"
              ? "font-bold text-main-pink bg-main-purple/20 rounded-lg"
              : "font-normal  hover:bg-main-purple/10 rounded-lg"
          }`}
        >
          <Link
            href="/perfil/informacoes-da-conta"
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
