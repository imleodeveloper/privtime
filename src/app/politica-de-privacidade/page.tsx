import { Footer } from "../../../components/footer";
import { Header } from "../../../components/header";

export default function PrivacidadePage() {
  return (
    <div className="w-full">
      <Header />
      <div className="max-w-3xl mx-auto p-8 text-gray-800 leading-relaxed">
        <h1 className="text-4xl font-bold mb-6 text-main-purple">
          Política de Privacidade
        </h1>
        <p className="mb-6 text-sm text-gray-600">
          Versão 1.0 – Atualizada em 18/08/2025
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-main-pink">
          1. Introdução
        </h2>
        <p>
          O <strong>PriveTime</strong> é um site voltado para o aplicativo de
          agendamentos <em>PriveTime App</em>. Esta Política de Privacidade tem
          como objetivo esclarecer quais dados pessoais coletamos, como eles são
          utilizados e quais são os direitos dos usuários.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-main-pink">
          2. Dados Coletados
        </h2>
        <p className="mb-2">
          Para criação de conta, coletamos as seguintes informações:
        </p>
        <ul className="list-disc list-inside mb-4">
          <li>Nome completo</li>
          <li>Data de nascimento (para verificação de maioridade +18)</li>
          <li>Telefone</li>
          <li>E-mail</li>
          <li>CPF</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-main-pink">
          3. Finalidade da Coleta
        </h2>
        <p>
          As informações coletadas são utilizadas para identificação do usuário,
          segurança da plataforma, comunicação e validação de idade, garantindo
          que apenas maiores de 18 anos utilizem o aplicativo.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-main-pink">
          4. Restrição de Idade
        </h2>
        <p>
          O <strong>PriveTime</strong> (site e aplicativo) é destinado
          exclusivamente a pessoas com idade igual ou superior a 18 anos. O
          cadastro e a utilização da plataforma por menores de idade não são
          permitidos.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-main-pink">
          5. Base Legal para Tratamento
        </h2>
        <p>
          O tratamento dos dados pessoais é realizado com fundamento no
          <strong> consentimento do usuário</strong> e/ou para o cumprimento de
          <strong> obrigações legais</strong>, em conformidade com a LGPD (Lei
          Geral de Proteção de Dados – Lei nº 13.709/2018).
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-main-pink">
          6. Pagamentos
        </h2>
        <p>
          Os pagamentos realizados no PriveTime são processados de forma segura
          pela plataforma <strong>PicPay</strong>. A partir do momento em que o
          usuário acessa o ambiente do PicPay, sua política de privacidade e
          segurança é de inteira responsabilidade da própria plataforma.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-main-pink">
          7. Compartilhamento de Dados
        </h2>
        <p>
          O PriveTime não vende, aluga ou compartilha dados pessoais com
          terceiros, exceto quando necessário para cumprimento de obrigações
          legais ou por ordem judicial.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-main-pink">
          8. Segurança
        </h2>
        <p>
          Adotamos medidas de segurança técnicas e administrativas para proteger
          seus dados pessoais contra acessos não autorizados, alterações ou
          divulgações indevidas.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-main-pink">
          9. Tempo de Armazenamento
        </h2>
        <p>
          Os dados coletados serão armazenados enquanto a conta do usuário
          estiver ativa ou pelo período necessário para cumprir obrigações
          legais, regulatórias e contratuais.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-main-pink">
          10. Direitos do Usuário
        </h2>
        <p>
          Você tem o direito de solicitar acesso, correção, exclusão ou
          portabilidade de seus dados pessoais, conforme a legislação aplicável
          (LGPD).
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-main-pink">
          11. Exclusão de Conta e Dados
        </h2>
        <p>
          Caso deseje excluir sua conta e os dados associados, o usuário deverá
          entrar em contato diretamente com nossa equipe pelo WhatsApp oficial.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-main-pink">
          12. Alterações nesta Política
        </h2>
        <p>
          Esta Política de Privacidade pode ser atualizada periodicamente.
          Recomendamos que os usuários revisem esta página regularmente para se
          manterem informados sobre eventuais mudanças.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-main-pink">
          13. Privacidade no Aplicativo de Agendamento
        </h2>
        <p>
          Para funcionamento do aplicativo de agendamento{" "}
          <strong>PriveTime</strong>, também coletamos informações como nome
          completo e telefone com o objetivo de facilitar a marcação de horários
          e a comunicação entre as partes envolvidas no agendamento.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-3 text-main-pink">
          14. Contato
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
