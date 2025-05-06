
import { Check, FileText, FileCheck, Download } from "lucide-react";

const steps = [
  {
    icon: <FileText className="w-12 h-12 text-brand-400" />,
    title: "Preencha o formulário",
    description:
      "Informe os dados essenciais como tipo de serviço, valores, prazos e informações das partes.",
  },
  {
    icon: <FileCheck className="w-12 h-12 text-brand-400" />,
    title: "Revise os detalhes",
    description:
      "Confira todas as informações antes de finalizar e faça ajustes se necessário.",
  },
  {
    icon: <Download className="w-12 h-12 text-brand-400" />,
    title: "Baixe o PDF",
    description:
      "Obtenha seu contrato pronto para uso, com validade jurídica e personalizado com seu nome.",
  },
];

const HowItWorks = () => {
  return (
    <section className="section bg-white" id="how-it-works">
      <div className="container-tight">
        <div className="text-center mb-14">
          <h2 className="mb-4">Como funciona</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Gerar seu contrato é um processo simples e rápido. Em poucos minutos você terá um documento personalizado e pronto para uso.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex justify-center mb-5">{step.icon}</div>
              <h3 className="text-xl font-medium mb-3">{step.title}</h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
