import { Headset } from "lucide-react";

export function WhatsAppButton() {
  return (
    <div className="group rounded-md bg-main-purple text-white font-bold text-center fixed overflow-hidden bottom-20 lg:bottom-12 right-4 lg:right-12 flex justify-center items-center shadow-xl text-sm transition-all duration-300 hover:transform hover:scale-110 animate-bounce">
      <a
        href="https://wa.me/5511984349772"
        target="_blank"
        rel="noopener noreferrer"
        className="flex justify-center items-center gap-2 p-2"
      >
        <Headset className="w-6 h-6"></Headset>
        <span className="hidden group-hover:block transition-all duration-300">
          Fale com o suporte
        </span>
      </a>
    </div>
  );
}
