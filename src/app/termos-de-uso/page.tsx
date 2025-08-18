import { Footer } from "../../../components/footer";
import { Header } from "../../../components/header";

export default function TermosUsoPage() {
  return (
    <div className="w-full">
      <Header />
      <div className="max-w-3xl mx-auto p-8 text-gray-800 leading-relaxed">
        <h1 className="text-4xl font-bold mb-6 text-main-purple">
          Termos de Uso
        </h1>
        <p className="mb-6 text-sm text-gray-600">
          Versão 1.0 – Atualizada em 18/08/2025
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-main-pink">
          1. Aceitação dos Termos
        </h2>
        <p>
          Ao utilizar o <strong>PriveTime</strong> e o aplicativo de
          agendamentos associado, o usuário concorda integralmente com os
          presentes Termos de Uso, que regem a utilização da plataforma.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-main-pink">
          2. Cadastro do Usuário
        </h2>
        <p>
          Para utilizar o aplicativo, é necessário realizar um cadastro
          fornecendo informações verídicas e completas, como nome completo, data
          de nascimento, telefone, e-mail e CPF. O usuário é responsável por
          manter suas informações atualizadas.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-main-pink">
          3. Idade Mínima
        </h2>
        <p>
          O <strong>PriveTime</strong> (site e aplicativo) é destinado
          exclusivamente para pessoas maiores de 18 anos. Ao utilizar a
          plataforma, o usuário declara possuir idade igual ou superior a 18
          anos e estar legalmente apto a celebrar contratos e utilizar os
          serviços oferecidos.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-main-pink">
          4. Uso da Plataforma
        </h2>
        <p>
          O PriveTime destina-se exclusivamente ao agendamento de serviços. O
          usuário compromete-se a utilizar a plataforma de forma ética, lícita e
          respeitosa, abstendo-se de qualquer prática que possa prejudicar
          terceiros ou o próprio funcionamento do sistema.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-main-pink">
          5. Pagamentos
        </h2>
        <p>
          Os pagamentos de serviços ou planos dentro da plataforma são
          processados exclusivamente pelo <strong>PicPay</strong>. O PriveTime
          não armazena dados financeiros sensíveis, sendo a responsabilidade do
          pagamento integralmente da plataforma de intermediação financeira.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-main-pink">
          6. Responsabilidades do Usuário
        </h2>
        <ul className="list-disc list-inside mb-4">
          <li>Fornecer informações corretas e atualizadas.</li>
          <li>Não utilizar a plataforma para fins ilícitos.</li>
          <li>Respeitar outros usuários e prestadores de serviços.</li>
          <li>Manter a confidencialidade de suas credenciais de acesso.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-main-pink">
          7. Propriedade Intelectual
        </h2>
        <p>
          Todos os direitos de marca, logotipos, design, layout, código-fonte e
          demais elementos do PriveTime são de propriedade exclusiva da
          plataforma, sendo vedada qualquer cópia, reprodução ou distribuição
          sem autorização prévia e expressa.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-main-pink">
          8. Rescisão e Cancelamento
        </h2>
        <p>
          O usuário pode solicitar a exclusão de sua conta a qualquer momento
          através do nosso WhatsApp oficial. O descumprimento dos presentes
          Termos poderá resultar no bloqueio ou exclusão do cadastro do usuário.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-main-pink">
          9. Alterações nos Termos
        </h2>
        <p>
          O PriveTime poderá modificar os Termos de Uso a qualquer momento,
          sendo responsabilidade do usuário consultar periodicamente esta página
          para estar ciente de eventuais alterações.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-main-pink">
          10. Contato
        </h2>
        <p className="mb-6">
          Em caso de dúvidas ou solicitações, fale conosco:
        </p>
        <a
          href="https://wa.me/5511984349772"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-6 py-3 bg-green-500 text-white font-semibold rounded-sm shadow-md border-b-4 border-green-700 hover:bg-green-600 transition"
        >
          Falar no WhatsApp
        </a>

        <p className="mt-10 text-sm text-gray-600 text-center">
          PriveTime © {new Date().getFullYear()} – Todos os direitos reservados.
        </p>
      </div>
      <Footer />
    </div>
  );
}
