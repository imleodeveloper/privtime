import { Suspense } from "react";
import { Header } from "../../../../components/header";
import { Footer } from "../../../../components/footer";
import { Button } from "../../../../components/ui/button";
import { Clock, Mail, Phone } from "lucide-react";
import Link from "next/link";

function PendingContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-2xl mx-auto text-center">
          <div>
            <div>
              <div className="flex justify-center mb-4">
                <Clock className="h-16 w-16 text-yellow-500" />
              </div>
              <div className="text-2xl text-[#022041]">
                Pagamento em Análise
              </div>
            </div>
            <div className="space-y-6">
              <p className="text-gray-600">
                Seu pagamento está sendo processado. Aguarde a confirmação que
                pode levar alguns minutos.
              </p>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">
                  Status do Pagamento:
                </h3>
                <ul className="text-sm text-yellow-700 space-y-1 text-left">
                  <li>• Pagamento enviado para análise</li>
                  <li>• Aguardando confirmação do banco</li>
                  <li>• Você receberá um email com o resultado</li>
                  <li>• Tempo estimado: até 2 horas</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">
                  Próximos Passos:
                </h3>
                <ul className="text-sm text-blue-700 space-y-1 text-left">
                  <li>• Aguarde o email de confirmação</li>
                  <li>• Verifique sua caixa de entrada e spam</li>
                  <li>• Em caso de aprovação, entraremos em contato</li>
                  <li>• Se rejeitado, você poderá tentar novamente</li>
                </ul>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold text-[#022041] mb-4">
                  Precisa de ajuda?
                </h3>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button className="flex items-center space-x-2 border border-main-pink bg-transparent hover:text-white">
                    <Mail className="h-4 w-4" />
                    <a
                      href="mailto:appviamodels@gmail.com"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      appviamodels@gmail.com
                    </a>
                  </Button>
                  <Button className="flex items-center space-x-2 border border-main-pink bg-transparent hover:text-white">
                    <Phone className="h-4 w-4" />
                    <a
                      href="https://wa.me/5511963646461"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      (11) 96364-6461
                    </a>
                  </Button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                <Button className="bg-[#1e90ff] hover:bg-[#022041] text-white">
                  <Link href="/perfil/historico-de-pagamentos">
                    Acompanhar Status
                  </Link>
                </Button>
                <Button className="bg-sub-background hover:text-white">
                  <Link href="/">Voltar ao Início</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function PendingPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <PendingContent />
    </Suspense>
  );
}
