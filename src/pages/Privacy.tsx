import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, Lock, Share2, Database, UserCog, Cookie } from "lucide-react";

const Privacy = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-brand-50 to-white py-16">
          <div className="container-tight">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-6">
                Política de Privacidade
              </h1>
              <p className="text-xl text-gray-600">
                Como protegemos seus dados
              </p>
            </div>
          </div>
        </section>

        {/* Privacy Content */}
        <section className="py-12">
          <div className="container-tight">
            <div className="max-w-3xl mx-auto prose prose-lg">
              <p className="lead text-xl text-gray-600">
                A sua privacidade é muito importante para nós. Por isso, esta Política de Privacidade foi criada para explicar com total transparência como coletamos, utilizamos, armazenamos e protegemos os seus dados pessoais ao usar o Contrato Flash. Ao acessar ou utilizar nossa plataforma, você concorda com os termos descritos abaixo.
              </p>

              <div className="space-y-12 mt-12">
                <section className="bg-white p-8 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-4 mb-6">
                    <Shield className="h-8 w-8 text-brand-400" />
                    <h2 className="text-2xl font-bold text-gray-900 m-0">1. Quais dados coletamos</h2>
                  </div>
                  <p>Ao utilizar a plataforma, podemos coletar os seguintes tipos de dados:</p>
                  <ul className="space-y-3">
                    <li>Dados de cadastro: nome completo, e-mail, telefone, CPF ou CNPJ, profissão e senha;</li>
                    <li>Informações contratuais: dados inseridos nos formulários de criação de contratos;</li>
                    <li>Dados de navegação: IP, tipo de dispositivo, navegador, páginas visitadas;</li>
                    <li>Dados de pagamento: informações fornecidas por intermediadores de pagamento.</li>
                  </ul>
                </section>

                <section className="bg-white p-8 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-4 mb-6">
                    <Database className="h-8 w-8 text-brand-400" />
                    <h2 className="text-2xl font-bold text-gray-900 m-0">2. Como utilizamos esses dados</h2>
                  </div>
                  <ul className="space-y-3">
                    <li>Criar e personalizar contratos jurídicos;</li>
                    <li>Gerenciar seu acesso e uso da plataforma;</li>
                    <li>Processar pagamentos de planos e serviços contratados;</li>
                    <li>Enviar notificações importantes e suporte técnico;</li>
                    <li>Garantir a segurança e desempenho da plataforma;</li>
                    <li>Cumprir obrigações legais e regulatórias.</li>
                  </ul>
                </section>

                {/* Previous sections remain the same */}
                
                <section className="bg-white p-8 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-4 mb-6">
                    <Share2 className="h-8 w-8 text-brand-400" />
                    <h2 className="text-2xl font-bold text-gray-900 m-0">3. Compartilhamento de dados</h2>
                  </div>
                  <p>O Contrato Flash não vende, aluga ou compartilha seus dados pessoais com terceiros para fins comerciais. Podemos, no entanto, compartilhar dados com:</p>
                  <ul className="space-y-3">
                    <li>Fornecedores de serviços que auxiliam no funcionamento da plataforma (como hospedagem, e-mail e analytics);</li>
                    <li>Empresas responsáveis pelo processamento de pagamentos;</li>
                    <li>Autoridades legais, quando exigido por lei ou decisão judicial.</li>
                  </ul>
                  <p className="mt-4">Todos os parceiros têm compromisso contratual de manter a confidencialidade e segurança das informações.</p>
                </section>

                <section className="bg-white p-8 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-4 mb-6">
                    <Lock className="h-8 w-8 text-brand-400" />
                    <h2 className="text-2xl font-bold text-gray-900 m-0">4. Armazenamento e segurança dos dados</h2>
                  </div>
                  <p>
                    Adotamos práticas avançadas de segurança para proteger seus dados contra acessos não autorizados, vazamentos ou destruição. Utilizamos servidores seguros, criptografia SSL, backups periódicos e controle de acesso rigoroso. Seus dados são armazenados pelo tempo necessário para cumprir os propósitos desta política ou conforme obrigações legais.
                  </p>
                </section>

                <section className="bg-white p-8 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-4 mb-6">
                    <UserCog className="h-8 w-8 text-brand-400" />
                    <h2 className="text-2xl font-bold text-gray-900 m-0">5. Seus direitos como titular de dados</h2>
                  </div>
                  <p>De acordo com a LGPD, você tem o direito de:</p>
                  <ul className="space-y-3">
                    <li>Acessar seus dados pessoais;</li>
                    <li>Corrigir dados incompletos ou desatualizados;</li>
                    <li>Solicitar a exclusão de seus dados (exceto quando houver obrigações legais);</li>
                    <li>Revogar consentimentos concedidos;</li>
                    <li>Solicitar portabilidade dos dados para outro serviço.</li>
                  </ul>
                  <p className="mt-4">Você pode exercer esses direitos entrando em contato com nossa equipe de suporte.</p>
                </section>

                <section className="bg-white p-8 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-4 mb-6">
                    <Cookie className="h-8 w-8 text-brand-400" />
                    <h2 className="text-2xl font-bold text-gray-900 m-0">6. Cookies e tecnologias similares</h2>
                  </div>
                  <p>
                    Utilizamos cookies e ferramentas de rastreamento para melhorar sua experiência na plataforma, entender padrões de uso e oferecer conteúdos relevantes. Você pode controlar ou desativar os cookies diretamente nas configurações do seu navegador.
                  </p>
                </section>

                <section className="bg-white p-8 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-4 mb-6">
                    <Shield className="h-8 w-8 text-brand-400" />
                    <h2 className="text-2xl font-bold text-gray-900 m-0">7. Alterações nesta Política</h2>
                  </div>
                  <p>
                    Esta Política de Privacidade pode ser atualizada a qualquer momento, para refletir mudanças na legislação ou melhorias em nossos serviços. A data da última atualização será sempre indicada ao final do documento. Recomendamos que você revise este conteúdo periodicamente.
                  </p>
                </section>
                <section className="bg-brand-50 p-8 rounded-xl">
                  <div className="flex items-center gap-4 mb-6">
                    <UserCog className="h-8 w-8 text-brand-400" />
                    <h2 className="text-2xl font-bold text-gray-900 m-0">8. Contato</h2>
                  </div>
                  <p className="m-0">
                    Em caso de dúvidas, sugestões ou solicitações relacionadas à sua privacidade, entre em contato conosco através dos canais disponíveis em nossa página de contato.
                  </p>
                </section>
              </div>

              <div className="mt-12 p-6 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-600 text-center m-0">
                  Última atualização: 11 de maio de 2025.<br />
                  Ao continuar utilizando nossa plataforma, você concorda com esta política de privacidade.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;