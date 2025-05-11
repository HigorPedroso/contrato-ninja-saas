import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import HowItWorks from "@/components/HowItWorks";
import Features from "@/components/Features";
import Testimonials from "@/components/Testimonials";
import PricingPlans from "@/components/PricingPlans";
import CtaSection from "@/components/CtaSection";
import { useAuth } from "@/contexts/AuthContext";

const Home = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="flex-1 flex items-center border-b border-gray-100 mt-5">
        <div className="container-tight w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-center md:text-left">
              <h1 className="font-bold mb-6 leading-tight">
                Gere <span className="gradient-text">Contratos Jurídicos</span> em Minutos
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-lg mx-auto md:mx-0">
                Crie contratos personalizados sem precisar contratar advogados caros. Simples, rápido e seguro para freelancers, designers e pequenas empresas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link to={user ? "/dashboard" : "/login"}>
                  <Button className="bg-brand-400 hover:bg-brand-500 text-white text-lg px-8 py-6 h-auto w-full sm:w-auto">
                    Crie seu contrato agora
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/modelos">
                  <Button variant="outline" className="text-lg px-6 py-6 h-auto w-full sm:w-auto">
                    Ver modelos
                  </Button>
                </Link>
              </div>
              <p className="text-gray-500 text-sm mt-4">
                Mais de 1.000 contratos gerados por freelancers e empresas
              </p>
            </div>
            <div className="relative hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-50 to-transparent rounded-lg transform -rotate-3"></div>
              <img
                src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80"
                alt="Contratos profissionais"
                className="relative z-10 rounded-lg shadow-xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-lg border border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckIcon className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="font-medium">Validado por advogados</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-10 bg-gray-50">
        <div className="container-tight">
          <p className="text-center text-gray-500 text-sm mb-6">
            UTILIZADO POR EMPRESAS DE TODOS OS TAMANHOS
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70">
            <div className="text-gray-400 font-semibold text-xl">TechSolutions</div>
            <div className="text-gray-400 font-semibold text-xl">InovaBrasil</div>
            <div className="text-gray-400 font-semibold text-xl">DigitalWave</div>
            <div className="text-gray-400 font-semibold text-xl">CriativaTech</div>
            <div className="text-gray-400 font-semibold text-xl">FuturoAgora</div>
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <HowItWorks />
      
      {/* Features */}
      <Features />
      
      {/* Testimonials */}
      <Testimonials />
      
      {/* Pricing Plans */}
      <PricingPlans />
      
      {/* CTA Section */}
      <CtaSection />
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

// Helper icon component
const CheckIcon = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default Home;
