import { Footer } from "../../../components/footer";
import { Header } from "../../../components/header";

export default function ReembolsoPage() {
  return (
    <div className="w-full">
      <Header />
      <div className="max-w-3xl mx-auto p-8 text-gray-800 leading-relaxed">
        <h1 className="text-4xl font-bold mb-6 text-main-purple">
          Política de Reembolso
        </h1>
        <p className="mb-6 text-sm text-gray-600">
          Versão 1.0 – Atualizada em 18/08/2025
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-main-pink">
          1. Período Gratuito
        </h2>
        <p>
          Ao criar uma conta no <strong>PriveTime</strong>, o usuário recebe{" "}
          <strong>7 dias gratuitos</strong> para testar a plataforma e o
          aplicativo de agendamento. Após esse período, o plano gratuito é
          automaticamente expirado, sendo necessário contratar um plano mensal
          ou anual para manter o acesso.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-main-pink">
          2. Garantia de Reembolso
        </h2>
        <p>
          Os planos <strong>mensal</strong> e <strong>anual</strong> contam com
          uma <strong>garantia de 7 dias</strong>. Durante esse prazo, o usuário
          poderá solicitar o reembolso integral, a qualquer momento, através do
          nosso WhatsApp oficial.
        </p>
        <p className="mt-3">
          Essa garantia está em total conformidade com o{" "}
          <strong>
            Código de Defesa do Consumidor (Lei nº 8.078/1990, Art. 49)
          </strong>
          , que assegura ao consumidor o direito de arrependimento em até 7 dias
          após a contratação de serviços pela internet.
        </p>
        <a
          href="https://wa.me/5511963646461"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 px-6 py-3 bg-green-500 text-white font-semibold rounded-sm shadow-md border-b-4 border-green-700 hover:bg-green-600 transition"
        >
          Solicitar Reembolso pelo WhatsApp
        </a>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-main-pink">
          3. Processamento dos Pagamentos
        </h2>
        <p>
          Todos os pagamentos da plataforma são processados exclusivamente pelo{" "}
          <strong>Pagar Me</strong>. O <strong>PriveTime</strong> não coleta,
          armazena ou processa dados financeiros sensíveis, como números de
          cartão de crédito ou senhas bancárias. Essas informações são tratadas
          diretamente pela plataforma de intermediação financeira.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-main-pink">
          4. Situações em que o Reembolso não se Aplica
        </h2>
        <ul className="list-disc list-inside mb-4">
          <li>
            Solicitações realizadas após o prazo de 7 dias corridos da
            contratação, conforme previsto em lei.
          </li>
          <li>
            Uso indevido ou violação dos{" "}
            <a href="/termos-de-uso" className="text-main-purple underline">
              Termos de Uso
            </a>
            .
          </li>
          <li>
            Cancelamento de planos por inadimplência ou descumprimento das
            regras da plataforma.
          </li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-main-pink">
          5. Procedimento de Reembolso
        </h2>
        <p>
          Para solicitar um reembolso dentro do prazo válido, o usuário deve
          entrar em contato através do nosso WhatsApp oficial. O valor será
          restituído pelo mesmo método de pagamento utilizado na contratação,
          observando os prazos da operadora financeira responsável.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-main-pink">
          6. Alterações na Política
        </h2>
        <p>
          O <strong>PriveTime</strong> poderá alterar esta Política de Reembolso
          a qualquer momento. Recomendamos que o usuário consulte regularmente
          esta página para estar atualizado sobre as condições vigentes.
        </p>

        <p className="mt-10 text-sm text-gray-600 text-center">
          PriveTime © {new Date().getFullYear()} – Todos os direitos reservados.
        </p>
      </div>
      <Footer />
    </div>
  );
}
