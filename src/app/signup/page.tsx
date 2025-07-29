import Image from "next/image";
import Link from "next/link";
import { Button } from "../../../components/ui/button";

export default function SignUp() {
  return (
    <div className="w-full">
      <main className="w-full mx-auto">
        <article className="w-full container mx-auto">
          <section className="flex justify-center items-center py-24">
            <form className="w-10/12 md:w-2/6 space-y-4 bg-sub-background/40 shadow-xl p-4 rounded-xl">
              <div className="relative w-full h-24 flex justify-center items-center">
                <Link href="/">
                  <Image
                    src="/privtime-fullpink.png"
                    alt=""
                    width={125}
                    height={125}
                  />
                </Link>
              </div>
              <div>
                <span className="text-gray-800 text-sm font-bold">
                  Olá! Use suas informações para cadastrar no site
                </span>
              </div>
              <div className="w-full flex flex-col justify-center items-start gap-2">
                <label htmlFor="email" className="text-sm text-gray-600">
                  Celular
                </label>
                <input
                  className="w-full bg-white px-2 py-1 rounded-lg"
                  type="text"
                  id="email"
                ></input>
              </div>
              <div className="w-full flex flex-col justify-center items-start gap-2">
                <label htmlFor="email" className="text-sm text-gray-600">
                  E-mail
                </label>
                <input
                  className="w-full bg-white px-2 py-1 rounded-lg"
                  type="text"
                  id="email"
                ></input>
              </div>
              <div className="w-full flex flex-col justify-center items-start gap-2">
                <label htmlFor="email" className="text-sm text-gray-600">
                  CPF
                </label>
                <input
                  className="w-full bg-white px-2 py-1 rounded-lg"
                  type="text"
                  id="email"
                ></input>
              </div>
              <div className="w-full flex flex-col justify-center items-start gap-2">
                <label htmlFor="email" className="text-sm text-gray-600">
                  Senha
                </label>
                <input
                  className="w-full bg-white px-2 py-1 rounded-lg"
                  type="text"
                  id="email"
                ></input>
              </div>
              <div className="w-full flex flex-col justify-center items-start gap-2">
                <label htmlFor="email" className="text-sm text-gray-600">
                  Confirmar Senha
                </label>
                <input
                  className="w-full bg-white px-2 py-1 rounded-lg"
                  type="text"
                  id="email"
                ></input>
              </div>
              <div>
                <Button className="w-full text-white">Cadastrar</Button>
              </div>
              <div className="text-center">
                <Link href="/signin">
                  <Button className="w-full bg-sub-purple">
                    Já tenho uma conta
                  </Button>
                </Link>
                <span className="w-full text-center text-sm text-gray-600">
                  Teste gratis por 7 dias
                </span>
              </div>
              <div className="text-center">
                <span className="text-sm">
                  Ao cadastrar, você concorda com nossos{" "}
                  <Link
                    href=""
                    className="text-blue-500 hover:text-blue-800 underline"
                  >
                    Termos de uso
                  </Link>{" "}
                  e{" "}
                  <Link
                    href=""
                    className="text-blue-500 hover:text-blue-800 underline"
                  >
                    Política de privacidade
                  </Link>
                </span>
              </div>
            </form>
          </section>
        </article>
      </main>
    </div>
  );
}
