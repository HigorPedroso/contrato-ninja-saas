
import { useEffect, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardStats from "@/components/dashboard/DashboardStats";
import RecentActivity from "@/components/dashboard/RecentActivity";
import ContractsList from "@/components/dashboard/ContractsList";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useGoogleAds } from "@/hooks/useGoogleAds";
import { useIsMobile } from "@/hooks/use-mobile";


const Dashboard = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { trackConversion } = useGoogleAds();
  const isMobile = useIsMobile();
  
  // Garantir que o perfil do usuário esteja atualizado
  useEffect(() => {
    if (user) {
      refreshProfile();
    }
  }, [user, refreshProfile]);

  const getUserName = () => {
    if (profile?.full_name) return profile.full_name.split(' ')[0];
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name.split(' ')[0];
    return "usuário";
  };

  useEffect(() => {
    trackConversion('NejPCIvNgswaELyn48kD');
  })

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 lg:ml-64">
        <DashboardHeader 
          title="Dashboard" 
          description={`Bem-vindo de volta, ${getUserName()}!`} 
        />
        
        <main className="container mx-auto px-4 lg:px-6 py-4 lg:py-8">
          <div className="mb-6 lg:mb-10">
            <DashboardStats />
          </div>
          
          {isMobile ? (
            // Mobile Layout
            <>
              <div className="mb-6">
                <div className="bg-white p-4 lg:p-6 rounded-lg border border-gray-200">
                  <div className="flex flex-col items-start gap-3">
                    <div>
                      <h2 className="text-lg font-medium mb-2">
                        Precisa de um novo contrato?
                      </h2>
                      <p className="text-gray-500 text-sm">
                        Crie contratos personalizados de forma rápida e simples
                      </p>
                    </div>
                    <Link to="/dashboard/criar-contrato" className="w-full">
                      <Button className="bg-brand-400 hover:bg-brand-500 w-full">
                        Criar Contrato <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
              
              {/* <div className="mb-6">
                <ContractsList />
              </div> */}
              
              <div>
                <RecentActivity />
              </div>
            </>
          ) : (
            // Desktop Layout
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2">
                  <ContractsList />
                </div>
                <div className="lg:col-span-1">
                  <RecentActivity />
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div>
                    <h2 className="text-xl font-medium mb-2">
                      Precisa de um novo contrato?
                    </h2>
                    <p className="text-gray-500">
                      Crie contratos personalizados de forma rápida e simples
                    </p>
                  </div>
                  <Link to="/dashboard/criar-contrato" className="mt-4 md:mt-0">
                    <Button className="bg-brand-400 hover:bg-brand-500">
                      Criar Contrato <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
