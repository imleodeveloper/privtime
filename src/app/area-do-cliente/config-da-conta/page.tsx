import Link from "next/link";
import { Footer } from "../../../../components/footer";
import { Header } from "../../../../components/header";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";

/*<div className="bg-sub-background w-auto p-8 h-96 shadow-xl rounded-xl relative flex flex-col justify-center items-center">
          <span className="text-center font-bold text-gray-700 my-6">
            Olá{" "}
            <span className="text-main-pink">{/*fetchProfile.full_name</span>
            ! <br />
            Altere o email ou senha aqui
          </span>
          <div className="flex flex-col justify-center items-start gap-1">
            <label htmlFor="email" className="text-sm text-gray-600">
              E-mail
            </label>
            <Input
              className="w-full bg-white px-2 py-1 rounded-lg"
              type="text"
              id="email"
              defaultValue="email@dominio.com"
            />
          </div>
          <div className="flex flex-col justify-center items-start gap-1">
            <label htmlFor="phone" className="text-sm text-gray-600">
              Telefone
            </label>
            <Input
              className="w-full bg-white px-2 py-1 rounded-lg"
              type="text"
              id="phone"
              defaultValue="(11) 99999-9999"
            />
          </div>
          <div className="flex flex-col justify-center items-start gap-1">
            <label htmlFor="password" className="text-sm text-gray-600">
              Senha
            </label>
            <Input
              className="w-full bg-white px-2 py-1 rounded-lg"
              type="text"
              id="password"
              defaultValue="••••••••"
            />
          </div>
          <Button className="w-full mt-2 text-white">Alterar</Button>
        </div> */

export default function ConfigDaContaPage() {
  return (
    <div className="w-full">
      <Header />
      <div className="w-full h-96 flex justify-center items-center flex-col gap-2">
        <h1 className="text-4xl text-center font-bold text-main-pink">
          Essa funcionalidade se encontra indisponível no momento.
        </h1>
        <h2 className="text-xl text-center font-semibold">
          Caso precise alterar suas informações como e-mail e senha, entre em
          contato com o nosso suporte:
        </h2>
        <Link
          href="https://wa.me/5511963646461"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button className="text-white mt-4">Falar com o suporte</Button>
        </Link>
      </div>
      <Footer />
    </div>
  );
}
