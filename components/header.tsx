import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";

export function Header() {
  return (
    <header className="w-full bg-sub-background ">
      <nav className="w-full flex justify-between items-center container mx-auto">
        <Link href="/" className="flex justify-center items-center relative">
          <Image
            src="/privtime-fullpink.png"
            alt="Logo PrivTime"
            width={100}
            height={50}
          />
        </Link>
        <div className="text-center">
          <ul className="flex justify-center items-center gap-4 text-sm font-semibold tracking-wide">
            <li className="text-main-purple hover:text-black transition duration-300">
              <Link href="/">Inicio</Link>
            </li>
            <li className="text-main-purple hover:text-black transition duration-300">
              <Link href="/">Planos</Link>
            </li>
            <li className="text-main-purple hover:text-black transition duration-300">
              <Link href="/">Sobre</Link>
            </li>
            <li className="text-main-purple hover:text-black transition duration-300">
              <Link href="/">ViaModels</Link>
            </li>
          </ul>
        </div>
        <div className="flex justify-center items-center">
          <Button className="shadow-xl">
            <Link href="/signin" className="text-white">
              Entrar
            </Link>
          </Button>
        </div>
      </nav>
    </header>
  );
}
