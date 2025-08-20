import { Headset } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function WhatsAppButton() {
  return (
    <div className="group rounded-md bg-main-purple text-white font-bold text-center fixed overflow-hidden bottom-20 lg:bottom-12 right-4 lg:right-12 flex justify-center items-center shadow-xl text-sm transition-all duration-300 hover:transform hover:scale-110 animate-bounce">
      <Link
        href="https://wa.me/5511963646461"
        target="_blank"
        rel="noopener noreferrer"
        className="flex justify-center items-center gap-2 p-2"
      >
        <Headset className="w-6 h-6"></Headset>
        <span className="hidden group-hover:block transition-all duration-300">
          Fale com o suporte
        </span>
      </Link>
    </div>
  );
}
