
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const PricingPlans = () => {
  const { user } = useAuth();
  
  const plans = [
    {
      name: "Gratuito",
      price: "R$ 0",
      period: "para sempre",
      description: "Ideal para testar a plataforma",
      features: [
        "3 contratos por mês",
        "Modelos básicos",
        "Download em PDF",
        "Suporte por email"
      ],
      featured: false,
      cta: "Começar grátis",
      ctaLink: user ? "/dashboard" : "/registro",
    },
    {
      name: "Premium",
      price: "R$ 19,90",
      period: "por mês",
      description: "Perfeito para freelancers e pequenas empresas",
      features: [
        "Contratos ilimitados",
        "Todos os modelos premium",
        "Personalização avançada",
        "Formatação com HTML",
        "Criação de posts no blog",
        "Suporte prioritário",
        "Sem marca d'água nos PDFs"
      ],
      featured: true,
      cta: "Assinar agora",
      ctaLink: user ? "/dashboard/assinatura" : "/registro",
    },
    {
      name: "Empresarial",
      price: "R$ 89,90",
      period: "por mês",
      description: "Para pequenas empresas",
      features: [
        "Tudo do plano Premium",
        "Múltiplos usuários (até 5)",
        "Dashboard de gestão",
        "Suporte telefônico",
        "Contratos personalizados",
        "API para integração"
      ],
      featured: false,
      cta: "Falar com consultor",
      ctaLink: "/contato",
    },
  ];

  return (
    <section className="section bg-gray-50">
      <div className="container-tight">
        <div className="text-center mb-14">
          <h2 className="mb-4">Planos que se adaptam às suas necessidades</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Escolha o plano ideal para você, com preços acessíveis e benefícios exclusivos.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md ${
                plan.featured
                  ? "border-2 border-brand-400 relative transform md:-translate-y-4"
                  : "border border-gray-100"
              }`}
            >
              {plan.featured && (
                <div className="bg-brand-400 text-white text-sm font-medium py-1 text-center">
                  Mais popular
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-medium mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-gray-500 ml-1">{plan.period}</span>
                </div>
                <p className="text-gray-600 mb-6">{plan.description}</p>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <Check className="h-5 w-5 text-brand-400 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link to={plan.ctaLink}>
                  <Button
                    className={`w-full ${
                      plan.featured
                        ? "bg-brand-400 hover:bg-brand-500 text-white"
                        : "bg-white border border-gray-200 hover:border-gray-300 text-gray-800"
                    }`}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Precisa de um plano personalizado para sua empresa?{" "}
            <Link to="/contato" className="text-brand-400 font-medium">
              Entre em contato
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default PricingPlans;
