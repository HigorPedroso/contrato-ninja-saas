
import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const SubscriptionPage = () => {
  const { user, profile, isSubscribed, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para assinar um plano",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId: planId }
      });
      
      if (error) throw error;
      
      // Se for o plano gratuito, redireciona para a página de contratos
      if (planId === "price_free" && data.url === "/dashboard/contratos") {
        window.location.href = data.url;
        return;
      }
      
      // Redireciona para o checkout do Stripe
      window.location.href = data.url;
    } catch (error: any) {
      console.error("Erro ao criar sessão de checkout:", error);
      toast({
        title: "Erro ao processar assinatura",
        description: "Não foi possível iniciar o processo de assinatura. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleManageSubscription = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {});
      
      if (error) throw error;
      
      // Redireciona para o portal do cliente Stripe
      window.location.href = data.url;
    } catch (error: any) {
      console.error("Erro ao abrir portal do cliente:", error);
      toast({
        title: "Erro ao gerenciar assinatura",
        description: "Não foi possível abrir o portal de gerenciamento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Verifica o status da assinatura ao carregar a página
  useEffect(() => {
    const checkSubscription = async () => {
      if (!user) return;
      
      try {
        await supabase.functions.invoke('check-subscription', {});
        await refreshProfile();
      } catch (error) {
        console.error("Erro ao verificar assinatura:", error);
      }
    };
    
    checkSubscription();
  }, [user]);
  
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };

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
        "Suporte por email",
      ],
      priceId: "price_free",
      featured: false,
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
        "Verificação de Assinatura válida",
        "Suporte prioritário",
        "Sem marca d'água nos PDFs",
        "Seu contrato sempre na nuvem"
      ],
      priceId: "price_premium",
      featured: true,
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 lg:ml-64">
        <DashboardHeader 
          title="Gerenciar Assinatura" 
          description="Escolha o plano ideal para as suas necessidades"
        />
        
        <main className="container mx-auto px-6 py-8">
          {/* Status da assinatura */}
          <Card className="p-6 mb-8 bg-white">
            <h2 className="text-lg font-medium mb-4">Status da sua assinatura</h2>
            
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="mb-1">
                  <span className="font-medium">Plano atual:</span>{" "}
                  {isSubscribed ? (
                    <Badge className="bg-brand-400">Premium</Badge>
                  ) : (
                    <Badge variant="outline">Gratuito</Badge>
                  )}
                </p>
                
                {isSubscribed && profile?.subscription_expires_at && (
                  <p className="text-sm text-gray-600">
                    Próxima cobrança em: {formatDate(profile.subscription_expires_at)}
                  </p>
                )}
              </div>
              
              {isSubscribed && (
                <Button
                  onClick={handleManageSubscription}
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Carregando...
                    </>
                  ) : (
                    "Gerenciar Assinatura"
                  )}
                </Button>
              )}
            </div>
          </Card>
          
          {/* Planos disponíveis */}
          <div className="grid md:grid-cols-2 gap-8">
            {plans.map((plan, index) => {
              const isPlanActive = plan.name === "Gratuito" ? !isSubscribed : isSubscribed;
              
              return (
                <Card 
                  key={index}
                  className={`overflow-hidden ${plan.featured ? 'border-brand-400 border-2' : ''} ${isPlanActive ? 'ring-2 ring-brand-400' : ''}`}
                >
                  {plan.featured && (
                    <div className="bg-brand-400 text-white text-center py-1 text-sm font-medium">
                      Mais popular
                    </div>
                  )}
                  
                  {isPlanActive && (
                    <div className="bg-brand-50 text-brand-500 text-center py-1 text-sm font-medium">
                      Seu plano atual
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
                    
                    {isPlanActive ? (
                      <Button
                        className="w-full bg-gray-200 text-gray-600 cursor-not-allowed"
                        disabled
                      >
                        Plano atual
                      </Button>
                    ) : (
                      <Button
                        className={`w-full ${plan.featured ? "bg-brand-400 hover:bg-brand-500" : ""}`}
                        variant={plan.featured ? "default" : "outline"}
                        onClick={() => handleSubscribe(plan.priceId)}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Carregando...
                          </>
                        ) : plan.name === "Gratuito" ? (
                          "Continuar no plano gratuito"
                        ) : (
                          "Assinar agora"
                        )}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SubscriptionPage;
