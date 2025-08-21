"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import {
  BriefcaseBusiness,
  Cog,
  GalleryThumbnails,
  House,
  LayoutGrid,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(false);
  const [userId, setUserId] = useState({
    id: "",
  });
  const [userLink, setUserLink] = useState({
    slug_link: "",
    link_app: "",
    link_share_app: "",
  });
  const [submenu, setSubmenu] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(!!data.session);
      if (data.session?.user.id) {
        setUserId({ id: data.session.user.id });
      }
    });
  }, []);

  useEffect(() => {
    const getSlug = async () => {
      try {
        const response = await fetch("/api/auth/header", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });

        const data = await response.json();

        if (data) {
          setUserLink({
            link_app: data.link_app,
            link_share_app: data.link_share_app,
            slug_link: data.slug_link,
          });
        }
      } catch (error) {
        console.error("Não foi possível fazer contato com o servidor: ", error);
        return;
      }
    };
    // só chama se tiver UUID válido
    if (userId.id) {
      getSlug();
    }
  }, [userId]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(false);
    window.location.href = "/signin";
  };

  return (
    <header className="w-full bg-sub-background lg:px-8">
      <nav className="w-full flex justify-between items-center container mx-auto">
        <div className="desktop hidden w-full lg:flex justify-between items-center container mx-auto">
          <Link href="/" className="flex justify-center items-center relative">
            <Image
              src="/privetime-users.png"
              alt="Logo PrivTime"
              width={100}
              height={50}
            />
          </Link>
          <div className="text-center">
            <ul className="flex justify-center items-center gap-12 text-base font-semibold tracking-wide">
              <li className="text-main-purple hover:text-black transition duration-300 ">
                <Link
                  href="/#inicio"
                  className="flex justify-center items-center gap-2"
                >
                  <House className="w-4 h-4"></House>
                  Inicio
                </Link>
              </li>
              <li className="text-main-purple hover:text-black transition duration-300">
                <Link
                  href="/#planos"
                  className="flex justify-center items-center gap-2"
                >
                  <BriefcaseBusiness className="w-4 h-4"></BriefcaseBusiness>
                  Planos
                </Link>
              </li>
              <li className="text-main-purple hover:text-black transition duration-300">
                <Link
                  href="/#sobre"
                  className="flex justify-center items-center gap-2"
                >
                  <Users className="w-4 h-4"></Users>
                  Sobre
                </Link>
              </li>
              <li className="text-main-purple hover:text-black transition duration-300">
                <Link
                  href="https://www.viamodels.com.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex justify-center items-center gap-2"
                >
                  <GalleryThumbnails className="w-4 h-4"></GalleryThumbnails>
                  ViaModels
                </Link>
              </li>
            </ul>
          </div>
          <div className="flex justify-center items-center gap-4">
            {!user ? (
              <Link href="/signin" className={`text-white`}>
                <Button className="shadow-xl">Entrar</Button>
              </Link>
            ) : (
              <div className="flex justify-center items-center gap-4">
                <div
                  className="justify-center items-center flex relative"
                  onMouseLeave={() => setSubmenu(!submenu)}
                  onMouseEnter={() => setSubmenu(!submenu)}
                >
                  <Button
                    className={`shadow-xl text-white ${
                      submenu ? "rounded-b-none" : "rounded-sm"
                    }`}
                  >
                    Configurações
                  </Button>
                  {submenu && (
                    <div className="absolute  z-[999] top-full pb-2 left-0 w-full h-auto flex justify-center items-start rounded-b-sm shadow-2xl bg-main-purple">
                      <ul className="text-white w-full text-center">
                        {userLink.link_app && (
                          <li className="text-sm font-bold hover:bg-main-pink w-full h-auto flex justify-center items-center transition-all duration-300 rounded-sm">
                            <Link
                              href={`${userLink.link_app}`}
                              className="w-full py-2 flex justify-center items-center gap-1"
                            >
                              <LayoutGrid className="w-4 h-4"></LayoutGrid>{" "}
                              Acessar App
                            </Link>
                          </li>
                        )}
                        <li className="text-sm font-bold hover:bg-main-pink w-full h-auto flex justify-center items-center transition-all duration-300 rounded-sm">
                          <Link
                            href="/area-do-cliente"
                            className="w-full py-2 flex justify-center items-center gap-1"
                          >
                            <User className="w-4 h-4"></User> Perfil
                          </Link>
                        </li>
                        <li className="text-sm font-bold hover:bg-main-pink w-full h-auto flex justify-center items-center transition-all duration-300 rounded-sm">
                          <Link
                            href="/area-do-cliente/config-da-conta"
                            className="w-full py-2 flex justify-center items-center gap-1"
                          >
                            <Cog className="w-4 h-4"></Cog> Config. da Conta
                          </Link>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
                <Button
                  className="shadow-xl bg-sub-purple text-black hover:text-white"
                  onClick={handleLogout}
                >
                  Sair
                </Button>
              </div>
            )}
          </div>
        </div>
        <div className="mobile visible flex lg:hidden justify-between items-center container mx-auto relative w-full">
          <Link href="/" className="flex justify-center items-center relative">
            <Image
              src="/privetime-users.png"
              alt="Logo PriveTime"
              width={100}
              height={50}
            />
          </Link>
          <div
            className={`${
              menuOpen === true ? "hidden" : "flex"
            } justify-center items-center cursor-pointer mr-6 hover:bg-main-pink p-2 rounded-full hover:text-white`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <PanelLeftOpen className="w-8 h-8"></PanelLeftOpen>
          </div>
          <div
            className={`menu-dropdown fixed top-0 left-0 w-full h-screen bg-[rgba(128,128,128,0.7)] shadow-2xl transform transition-all duration-300 z-50 ${
              menuOpen
                ? "translate-x-0 opacity-100"
                : "-translate-x-full opacity-0 pointer-events-none"
            }`}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div
              className={`w-10/12 h-screen overflow-y-auto flex justify-start items-start flex-col bg-sub-background pl-6 gap-8 pb-8 shadow-2xl transform transition-all duration-900 ${
                menuOpen
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-full opacity-0 pointer-events-none"
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full flex justify-between items-center">
                <Link
                  href="/"
                  className="flex justify-center items-center relative"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  <Image
                    src="/privetime-users.png"
                    alt="Logo PriveTime"
                    width={100}
                    height={50}
                  />
                </Link>
                <div
                  className={`${
                    !menuOpen ? "hidden" : "flex"
                  } justify-center items-center cursor-pointer mr-6 hover:bg-main-pink p-2 rounded-full hover:text-white`}
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  <PanelLeftClose className="w-8 h-8"></PanelLeftClose>
                </div>
              </div>
              <div className="text-center">
                <ul className="flex flex-col justify-start items-start gap-12 text-base font-semibold tracking-wide">
                  <li className="text-main-purple hover:text-black transition duration-300 ">
                    <Link
                      href="/#inicio"
                      className="flex justify-center items-center gap-2"
                      onClick={() => setMenuOpen(!menuOpen)}
                    >
                      <House className="w-4 h-4"></House>
                      Inicio
                    </Link>
                  </li>
                  <li className="text-main-purple hover:text-black transition duration-300">
                    <Link
                      href="/#planos"
                      className="flex justify-center items-center gap-2"
                      onClick={() => setMenuOpen(!menuOpen)}
                    >
                      <BriefcaseBusiness className="w-4 h-4"></BriefcaseBusiness>
                      Planos
                    </Link>
                  </li>
                  <li className="text-main-purple hover:text-black transition duration-300">
                    <Link
                      href="/#via-models"
                      className="flex justify-center items-center gap-2"
                      onClick={() => setMenuOpen(!menuOpen)}
                    >
                      <Users className="w-4 h-4"></Users>
                      Sobre
                    </Link>
                  </li>
                  <li className="text-main-purple hover:text-black transition duration-300">
                    <Link
                      href="https://www.viamodels.com.br/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex justify-center items-center gap-2"
                      onClick={() => setMenuOpen(!menuOpen)}
                    >
                      <GalleryThumbnails className="w-4 h-4"></GalleryThumbnails>
                      ViaModels
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="flex justify-center items-center gap-4">
                {!user ? (
                  <Link href="/signin" className={`text-white`}>
                    <Button className="shadow-xl">Entrar</Button>
                  </Link>
                ) : (
                  <div className="flex justify-center items-center gap-4">
                    <div
                      className="justify-center items-center flex relative"
                      onMouseLeave={() => setSubmenu(!submenu)}
                      onMouseEnter={() => setSubmenu(!submenu)}
                    >
                      <Button
                        className={`shadow-xl text-white ${
                          submenu ? "rounded-b-none" : "rounded-sm"
                        }`}
                      >
                        Configurações
                      </Button>
                      {submenu && (
                        <div className="absolute  z-[999] top-full pb-2 left-0 w-full h-auto flex justify-center items-start rounded-b-sm shadow-2xl bg-main-purple">
                          <ul className="text-white w-full text-center">
                            {userLink.link_app && (
                              <li className="text-sm font-bold hover:bg-main-pink w-full h-auto flex justify-center items-center transition-all duration-300 rounded-sm">
                                <Link
                                  href={`${userLink.link_app}`}
                                  className="w-full py-2 flex justify-center items-center gap-1"
                                >
                                  <LayoutGrid className="w-4 h-4"></LayoutGrid>{" "}
                                  Acessar App
                                </Link>
                              </li>
                            )}
                            <li className="text-sm font-bold hover:bg-main-pink w-full h-auto flex justify-center items-center transition-all duration-300 rounded-sm">
                              <Link
                                href="/area-do-cliente"
                                className="w-full py-2 flex justify-center items-center gap-1"
                              >
                                <User className="w-4 h-4"></User> Perfil
                              </Link>
                            </li>
                            <li className="text-sm font-bold hover:bg-main-pink w-full h-auto flex justify-center items-center transition-all duration-300 rounded-sm">
                              <Link
                                href="/area-do-cliente/config-da-conta"
                                className="w-full py-2 flex justify-center items-center gap-1"
                              >
                                <Cog className="w-4 h-4"></Cog> Config. da Conta
                              </Link>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                    <Button
                      className="shadow-xl bg-sub-purple text-black hover:text-white"
                      onClick={handleLogout}
                    >
                      Sair
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
