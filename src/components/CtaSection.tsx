
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CtaSection = () => {
  return (
    <section className="section bg-brand-50">
      <div className="container-tight text-center">
        <h2 className="mb-4 text-4xl font-semibold">
          Proteja seu trabalho e evite problemas legais
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          Crie contratos profissionais rapidamente e com segurança jurídica.
          Comece agora a proteger seu negócio.
        </p>
        <div className="flex justify-center flex-wrap gap-4">
          <Link to="/registro">
            <Button className="bg-brand-400 hover:bg-brand-500 text-white text-lg px-8 py-6 h-auto flex items-center">
              Crie seu contrato agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link to="/modelos">
            <Button variant="outline" className="text-lg px-8 py-6 h-auto">
              Ver modelos disponíveis
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
