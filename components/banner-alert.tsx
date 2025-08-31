import { useEffect } from "react";

export function Banner({
  type,
  show,
  hide,
  message,
}: {
  type: string;
  show: boolean;
  hide: () => void;
  message: string;
}) {
  return (
    <div
      className={`fixed top-8 right-0 left-0 mx-auto lg:left-auto lg:top-5 lg:right-5 flex justify-center items-center transition-all duration-1000 ${
        show
          ? "fixed opacity-100 translate-x-0 z-[999] pointer-events-none"
          : "fixed opacity-0 -translate-x-6 pointer-events-none -z-40"
      }`}
    >
      <div
        className={`w-sm flex flex-col justify-center items-center gap-4 ${
          type === "error"
            ? "bg-red-800 border-3 border-red-600"
            : "bg-green-800 border-3 border-green-400"
        } p-4 rounded-lg ${
          show ? "opacity-100 translate-x-0" : "opacity-0 translate-x-6"
        } transition-all duration-600`}
      >
        <div
          className={`w-full flex justify-start items-center pb-2 border-b ${
            type === "error" ? "border-red-900" : "border-green-900"
          }`}
        >
          <span className={`text-white font-bold`}>
            {type === "error" ? "Erro!" : "Sucesso!"}
          </span>
        </div>
        <div className="w-full flex justify-start items-start py-2 text-white">
          {message}
        </div>
      </div>
    </div>
  );
}
