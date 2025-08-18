"use client";
import Image from "next/image";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

export function BannerAge() {
  const [isUnder, setIsUnder] = useState(false);
  const [isOver, setIsOver] = useState(false);

  const overYear = () => {
    localStorage.setItem("isAdult", "true");
    setIsOver(true);
  };

  const underYear = () => {
    localStorage.setItem("isAdult", "false");
    setIsUnder(true);
  };

  useEffect(() => {
    const getStorage = localStorage.getItem("isAdult");
    if (getStorage === "false") {
      setIsUnder(true);
    }

    if (getStorage === "true") {
      setIsOver(true);
    }
  }, []);

  return (
    <div
      className={`group w-full h-full fixed top-0 left-0 flex justify-center items-center backdrop-blur-sm z-1 ${
        isOver ? "hidden" : "visible"
      }`}
    >
      {isUnder === true ? (
        <div className="w-[90%] relative lg:w-full max-w-3xl bg-sub-background rounded-sm flex flex-col justify-center items-center p-4">
          <div className="w-24 h-24 relative flex justify-center items-center">
            <Image
              src="/privetime-users.png"
              alt=""
              fill
              className="object-cover"
            />
          </div>
          <span className="text-2xl font-bold text-center">
            Desculpe, você é muito jovem para continuar
          </span>
          <div
            className="absolute top-4 right-4 flex justify-center items-center p-2 rounded-full bg-main-pink cursor-pointer hover:bg-main-purple"
            onClick={() => setIsUnder(!isUnder)}
          >
            <X className="w-6 h-6 text-white"></X>
          </div>
        </div>
      ) : (
        <div className="w-[90%] lg:w-full max-w-3xl bg-sub-background rounded-sm flex flex-col justify-center items-center p-4">
          <div className="w-24 h-24 relative flex justify-center items-center">
            <Image
              src="/privetime-users.png"
              alt=""
              fill
              className="object-cover"
            />
          </div>
          <span className="text-2xl lg:text-4xl font-bold uppercase text-center text-main-pink mt-4 mb-2">
            Bem-vindo ao PriveTime
          </span>
          <span className="text-lg lg:text-xl font-bold text-center mb-4">
            Por favor, confirme sua idade para entrar:
          </span>
          <div className="grid grid-cols-2 gap-2 items-center">
            <Button
              className="bg-main-purple text-white text-center text-sm lg:text-base"
              onClick={() => overYear()}
            >
              Eu tenho mais de 18 anos
            </Button>
            <button
              className="px-4 py-2 rounded font-bold cursor-pointer text-sm lg:text-base bg-gray-400 hover:bg-gray-600 text-black"
              onClick={() => underYear()}
            >
              Eu tenho menos de 18 anos
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
