import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ContractsList from "@/components/dashboard/ContractsList";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileSidebar from "@/components/dashboard/MobileSidebar";

const Contracts = () => {
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
          title="Meus Contratos"
          description="Visualize e gerencie todos os seus contratos"
        />

        <main className="container mx-auto px-4 lg:px-6 py-4 lg:py-8 pb-20 lg:pb-8">
          <ContractsList />
        </main>
      </div>
    </div>
  );
};

export default Contracts;
