import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, Clock, Users, Sparkles } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-brand-50 to-white py-20">
          <div className="container-tight">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Sobre o <span className="gradient-text">Contrato Flash</span>
              </h1>
              <p className="text-xl text-gray-600">
                Simplificando a forma como profissionais independentes protegem seu trabalho
              </p>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16">
          <div className="container-tight">
            <div className="max-w-3xl mx-auto">
              <div className="prose prose-lg">
                <p className="lead text-xl text-gray-600 mb-8">
                  Em um mercado cada vez mais dinâmico, onde profissionais independentes precisam atuar com agilidade, segurança e profissionalismo, o Contrato Flash nasceu com uma missão simples: eliminar a burocracia dos contratos e proteger o trabalho de quem vive de projetos.
                </p>

                {/* Feature Cards */}
                <div className="grid md:grid-cols-2 gap-6 my-12">
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <Shield className="h-8 w-8 text-brand-400 mb-4" />
                    <h3 className="font-semibold text-lg mb-2">Segurança Garantida</h3>
                    <p className="text-gray-600">Contratos validados por advogados especialistas em direito digital</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <Clock className="h-8 w-8 text-brand-400 mb-4" />
                    <h3 className="font-semibold text-lg mb-2">Rapidez e Praticidade</h3>
                    <p className="text-gray-600">Gere contratos personalizados em questão de minutos</p>
                  </div>
                </div>

                <p className="mb-6">
                  Seja você freelancer, designer ou consultor, sabemos o quanto seu tempo é valioso. E mais ainda: sabemos o quanto é frustrante lidar com modelos de contrato desatualizados, confusos ou até mesmo arriscar fechar acordos sem nenhuma formalização.
                </p>

                <div className="my-12 bg-brand-50 p-8 rounded-xl">
                  <h2 className="text-2xl font-bold mb-4">Nossa Missão</h2>
                  <p className="text-lg">
                    O Contrato Flash foi criado por pessoas que conhecem a rotina do trabalho autônomo. Por isso, desenvolvemos uma plataforma rápida, intuitiva e segura, que permite gerar contratos jurídicos personalizados em poucos cliques.
                  </p>
                </div>

                <p className="mb-8">
                  Nosso compromisso é com a sua autonomia. Queremos que você invista seu tempo no que realmente importa: criar, executar e entregar com excelência. Enquanto isso, nós cuidamos da parte chata — oferecendo contratos claros, profissionais e prontos para assinatura.
                </p>

                {/* Stats Section */}
                <div className="bg-white p-8 rounded-xl border border-gray-100 my-12">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="text-center">
                      <Users className="h-8 w-8 text-brand-400 mx-auto mb-4" />
                      <div className="text-3xl font-bold text-gray-900 mb-2">1000+</div>
                      <div className="text-gray-600">Profissionais Atendidos</div>
                    </div>
                    <div className="text-center">
                      <Sparkles className="h-8 w-8 text-brand-400 mx-auto mb-4" />
                      <div className="text-3xl font-bold text-gray-900 mb-2">98%</div>
                      <div className="text-gray-600">Satisfação dos Usuários</div>
                    </div>
                  </div>
                </div>

                <p className="mb-8">
                  Hoje, o Contrato Flash já é utilizado por profissionais de todos os tamanhos, desde quem está começando até agências criativas e consultores experientes. E isso é só o começo. Seguimos evoluindo a plataforma todos os dias, ouvindo nossos usuários, simplificando processos e buscando sempre entregar uma experiência cada vez melhor.
                </p>

                <div className="bg-brand-400 text-white p-8 rounded-xl text-center my-12">
                  <p className="text-xl font-medium">
                    Se você também acredita que tempo é dinheiro — e que segurança é essencial — então o Contrato Flash foi feito pra você.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;