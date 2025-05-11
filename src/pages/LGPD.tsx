import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, Lock, Target, Database, UserCog, Bell } from "lucide-react";

const LGPD = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-brand-50 to-white py-16">
          <div className="container-tight">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-4">
                LGPD – Lei Geral de Proteção de Dados
              </h1>
              <p className="text-xl text-gray-600">
                Como garantimos a conformidade com a Lei nº 13.709/2018
              </p>
            </div>
          </div>
        </section>

        {/* LGPD Content */}
        <section className="py-12">
          <div className="container-tight">
            <div className="max-w-3xl mx-auto prose prose-lg">
              <p className="lead text-xl text-gray-600">
                A segurança, privacidade e transparência no uso dos seus dados são prioridades no Contrato Flash. Estamos totalmente comprometidos com a conformidade à Lei nº 13.709/2018 — a LGPD, que estabelece as diretrizes para o tratamento de dados pessoais no Brasil. Nesta página, explicamos como lidamos com seus dados, quais são seus direitos e como você pode exercê-los dentro da nossa plataforma.
              </p>

              <div className="space-y-12 mt-12">
                <section className="bg-white p-8 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-4 mb-6">
                    <Shield className="h-8 w-8 text-brand-400" />
                    <h2 className="text-2xl font-bold text-gray-900 m-0">1. O que é a LGPD?</h2>
                  </div>
                  <p>
                    A LGPD é a Lei Geral de Proteção de Dados Pessoais, criada para garantir o direito à privacidade, à proteção de dados e à transparência no uso de informações pessoais por empresas e plataformas digitais. Ela regulamenta como dados devem ser coletados, tratados, armazenados e eliminados.
                  </p>
                </section>

                <section className="bg-white p-8 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-4 mb-6">
                    <Database className="h-8 w-8 text-brand-400" />
                    <h2 className="text-2xl font-bold text-gray-900 m-0">2. Quais dados coletamos?</h2>
                  </div>
                  <p>O Contrato Flash coleta apenas os dados necessários para oferecer um serviço eficiente e seguro. Entre eles:</p>
                  <ul className="space-y-3">
                    <li>Nome, e-mail, CPF ou CNPJ, telefone;</li>
                    <li>Informações para personalização dos contratos (dados do cliente, escopo do serviço, valores etc.);</li>
                    <li>Dados de navegação e acesso, como IP, localização aproximada e dispositivo utilizado;</li>
                    <li>Informações de pagamento, quando aplicável.</li>
                  </ul>
                  <p className="mt-4">Todos os dados são tratados com finalidades específicas, legítimas e informadas.</p>
                </section>

                <section className="bg-white p-8 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-4 mb-6">
                    <Target className="h-8 w-8 text-brand-400" />
                    <h2 className="text-2xl font-bold text-gray-900 m-0">3. Finalidade do uso dos dados</h2>
                  </div>
                  <p>Os dados são usados com os seguintes objetivos:</p>
                  <ul className="space-y-3">
                    <li>Criar e personalizar contratos jurídicos;</li>
                    <li>Fornecer acesso à plataforma e seus recursos;</li>
                    <li>Garantir a segurança das informações;</li>
                    <li>Processar pagamentos de planos contratados;</li>
                    <li>Cumprir obrigações legais e regulatórias;</li>
                    <li>Melhorar a experiência de navegação e uso.</li>
                  </ul>
                  <p className="mt-4">Nunca utilizamos seus dados para fins discriminatórios, comerciais indevidos ou sem o seu consentimento.</p>
                </section>

                <section className="bg-white p-8 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-4 mb-6">
                    <UserCog className="h-8 w-8 text-brand-400" />
                    <h2 className="text-2xl font-bold text-gray-900 m-0">4. Seus direitos como titular de dados</h2>
                  </div>
                  <p>Você tem total controle sobre os seus dados pessoais. Conforme a LGPD, você pode:</p>
                  <ul className="space-y-3">
                    <li>Confirmar se tratamos seus dados;</li>
                    <li>Acessar as informações que temos sobre você;</li>
                    <li>Corrigir dados incompletos ou desatualizados;</li>
                    <li>Solicitar a exclusão dos dados, quando possível legalmente;</li>
                    <li>Solicitar portabilidade para outra plataforma;</li>
                    <li>Revogar consentimentos dados anteriormente;</li>
                    <li>Solicitar informações sobre compartilhamento de dados com terceiros.</li>
                  </ul>
                  <p className="mt-4">Para exercer qualquer desses direitos, entre em contato conosco pelo e-mail: [seuemail@contratoflash.com].</p>
                </section>

                <section className="bg-white p-8 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-4 mb-6">
                    <Lock className="h-8 w-8 text-brand-400" />
                    <h2 className="text-2xl font-bold text-gray-900 m-0">5. Medidas de segurança</h2>
                  </div>
                  <p>Adotamos práticas rigorosas de proteção de dados, incluindo:</p>
                  <ul className="space-y-3">
                    <li>Criptografia de ponta a ponta;</li>
                    <li>Servidores com segurança reforçada;</li>
                    <li>Backups automáticos e monitoramento contínuo;</li>
                    <li>Acesso restrito aos dados por parte da equipe interna;</li>
                    <li>Armazenamento mínimo, por tempo necessário e com exclusão segura.</li>
                  </ul>
                </section>

                <section className="bg-white p-8 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-4 mb-6">
                    <Bell className="h-8 w-8 text-brand-400" />
                    <h2 className="text-2xl font-bold text-gray-900 m-0">6. Consentimento e transparência</h2>
                  </div>
                  <p>
                    Todo o uso de dados no Contrato Flash depende do seu consentimento livre, informado e inequívoco. Você será informado sempre que houver mudanças significativas em nossa política de dados. Nosso objetivo é garantir que você tenha plena confiança no uso da plataforma.
                  </p>
                </section>
              </div>

              <div className="mt-12 p-6 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-600 text-center m-0">
                  Atualizado em: 11 de maio de 2025<br />
                  Em caso de dúvidas, entre em contato com nosso DPO (Data Protection Officer).
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

export default LGPD;