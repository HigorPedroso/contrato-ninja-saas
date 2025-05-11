import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-brand-50 to-white py-16">
          <div className="container-tight">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-6">
                Termos de Uso
              </h1>
              <p className="text-xl text-gray-600">
                Última atualização: {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </section>

        {/* Terms Content */}
        <section className="py-12">
          <div className="container-tight">
            <div className="max-w-3xl mx-auto prose prose-lg">
              <p className="lead">
                Bem-vindo ao Contrato Flash. Ao acessar e utilizar nossa plataforma, você concorda com os seguintes Termos de Uso. Leia atentamente antes de utilizar nossos serviços. Caso não concorde com estes termos, recomendamos que não utilize a plataforma.
              </p>
<br></br>
              <div className="space-y-12">
                <section>
                  <h2 className="text-2xl font-bold text-gray-900">1. Sobre a Plataforma</h2>
                  <p>
                    O Contrato Flash é uma ferramenta online destinada à criação de contratos jurídicos personalizados para freelancers, designers, consultores e outros profissionais autônomos. A plataforma permite gerar contratos por meio de um sistema automatizado, com base em informações fornecidas pelo próprio usuário.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900">2. Aceitação dos Termos</h2>
                  <p>
                    Ao se cadastrar ou utilizar qualquer funcionalidade do Contrato Flash, você declara ter lido, entendido e concordado com estes Termos de Uso. O uso contínuo da plataforma será considerado como aceitação tácita das condições aqui descritas.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-bold text-gray-900">3. Cadastro e Responsabilidades do Usuário</h2>
                  <p>
                    Para utilizar as funcionalidades da plataforma, o usuário deve fornecer informações verídicas e completas no momento do cadastro. É de responsabilidade exclusiva do usuário:
                  </p>
                  <ul className="list-disc pl-6 mt-4 space-y-2">
                    <li>Fornecer dados reais e atualizados;</li>
                    <li>Manter a confidencialidade do login e senha;</li>
                    <li>Utilizar os contratos de maneira ética, legal e responsável;</li>
                    <li>Assumir integralmente o conteúdo e as consequências dos documentos gerados.</li>
                  </ul>
                </section>

                {/* Continue with sections 4-10 following the same pattern */}
                {/* ... */}

                <section>
                  <h2 className="text-2xl font-bold text-gray-900">10. Contato</h2>
                  <p>
                    Em caso de dúvidas sobre estes Termos de Uso ou sobre a plataforma, entre em contato conosco através dos canais disponíveis em nossa página de contato.
                  </p>
                </section>
              </div>

              <div className="mt-12 p-6 bg-gray-50 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-600 text-center">
                  Estes termos foram atualizados pela última vez em {new Date().toLocaleDateString('pt-BR')}. 
                  Ao continuar utilizando nossa plataforma, você concorda com estes termos.
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

export default Terms;