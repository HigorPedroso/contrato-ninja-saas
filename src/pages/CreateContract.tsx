import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ContractForm from "@/components/dashboard/ContractForm";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileSidebar from "@/components/dashboard/MobileSidebar";

const CreateContract = () => {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />

      {/* Main Content */}
      <div className={`flex-1 ${!isMobile ? "lg:ml-64" : ""}`}>
        <DashboardHeader
          title="Criar Contrato"
          description="Preencha o formulário para gerar seu contrato personalizado"
        />

        <main className="container mx-auto px-6 py-8">
          <ContractForm />
        </main>
      </div>
    </div>
  );
};

export default CreateContract;
