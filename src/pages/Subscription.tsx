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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { CreditCard, AlertTriangle } from "lucide-react";

const SubscriptionPage = () => {
  const { user, profile, isSubscribed, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [isPreCanceling, setIsPreCanceling] = useState(false);
  
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

  const handleCancelSubscription = async () => {
    if (!user) return;
    
    setCancelLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription', {});
      
      if (error) throw error;
      
      await refreshProfile();
      setShowManageModal(false);
      
      toast({
        title: "Assinatura será cancelada",
        description: `Você continuará tendo acesso premium até ${formatDate(profile?.subscription_expires_at)}.`,
      });
    } catch (error: any) {
      console.error("Erro ao cancelar assinatura:", error);
      toast({
        title: "Erro ao cancelar assinatura",
        description: "Não foi possível cancelar sua assinatura. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setCancelLoading(false);
    }
  };
  
  const handleManageSubscription = () => {
    setShowManageModal(true);
  };

  const ManageSubscriptionModal = () => (
    <Dialog open={showManageModal} onOpenChange={setShowManageModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerenciar Assinatura</DialogTitle>
          <DialogDescription>
            Detalhes do seu plano Premium
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-4 rounded-lg border p-4">
            <CreditCard className="h-6 w-6 text-brand-400" />
            <div>
              <p className="font-medium">Plano Premium</p>
              <p className="text-sm text-gray-500">R$ 19,90/mês</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 mb-2">Próxima cobrança:</p>
            <p className="font-medium">{formatDate(profile?.subscription_expires_at)}</p>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                className="w-full"
                disabled={isPreCanceling}
              >
                {isPreCanceling ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelando...
                  </div>
                ) : (
                  "Cancelar assinatura"
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Cancelar assinatura
                  </div>
                </AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja cancelar sua assinatura? Você perderá acesso aos recursos premium ao final do período atual.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setIsPreCanceling(false)}>Voltar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    setIsPreCanceling(true);
                    await handleCancelSubscription();
                    setIsPreCanceling(false);
                  }}
                  disabled={cancelLoading}
                  className="bg-red-500 hover:bg-red-600"
                >
                  {cancelLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </div>
                  ) : (
                    "Confirmar cancelamento"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>        
          
        </div>
      </DialogContent>
    </Dialog>
  );

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
      name: "Premium Mensal",
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
      priceId: "price_premium_monthly",
      featured: true,
    },
    {
      name: "Premium Anual",
      price: "R$ 190,90",
      originalPrice: "R$ 238,80",
      period: "por ano",
      discount: "20% de desconto",
      description: "Melhor custo-benefício",
      features: [
        "Contratos ilimitados",
        "Todos os modelos premium",
        "Personalização avançada",
        "Verificação de Assinatura válida",
        "Suporte prioritário",
        "Sem marca d'água nos PDFs",
        "Seu contrato sempre na nuvem",
        "Economia de R$ 47,90"
      ],
      priceId: "price_premium_yearly",
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
        
        <main className="container mx-auto px-6 py-8 mb-24">
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
          <div className="grid md:grid-cols-3 gap-6">
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
                      {plan.originalPrice && (
                        <div className="mt-1">
                          <span className="text-sm text-gray-500 line-through">{plan.originalPrice}</span>
                          <span className="ml-2 text-sm font-medium text-green-600">{plan.discount}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600 mb-6">{plan.description}</p>
                    
                    {plan.name === "Premium Anual" && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                        <p className="text-green-700 font-medium text-center">
                          Economize R$ 47,90 no plano anual! 🎉
                        </p>
                      </div>
                    )}

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
      <ManageSubscriptionModal />
    </div>
  );
};

export default SubscriptionPage;
