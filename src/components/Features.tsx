
import { Shield, Clock, RefreshCcw, CheckCircle } from "lucide-react";

const features = [
  {
    icon: <Shield className="w-10 h-10 text-brand-400" />,
    title: "Validação Jurídica",
    description:
      "Todos os contratos são elaborados e validados por advogados especialistas em direito civil e comercial.",
  },
  {
    icon: <Clock className="w-10 h-10 text-brand-400" />,
    title: "Rápido e Eficiente",
    description:
      "Economize tempo criando contratos em minutos, não em dias ou semanas como em escritórios tradicionais.",
  },
  {
    icon: <RefreshCcw className="w-10 h-10 text-brand-400" />,
    title: "Modelos Atualizados",
    description:
      "Nossos templates são constantemente atualizados conforme a legislação brasileira e melhores práticas do mercado.",
  },
  {
    icon: <CheckCircle className="w-10 h-10 text-brand-400" />,
    title: "Armazenamento Seguro",
    description:
      "Todos os seus contratos ficam armazenados com segurança na nuvem, acessíveis a qualquer momento.",
  },
];

const Features = () => {
  return (
    <section className="section bg-gray-50">
      <div className="container-tight">
        <div className="text-center mb-14">
          <h2 className="mb-4">Por que escolher o ContratoFlash?</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Nossa plataforma foi criada para tornar a geração de contratos simples e acessível, mesmo para quem não tem conhecimento jurídico.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="mr-5 mt-1">{feature.icon}</div>
              <div>
                <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
