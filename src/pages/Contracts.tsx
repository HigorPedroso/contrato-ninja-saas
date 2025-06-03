import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ContractsList from "@/components/dashboard/ContractsList";
import { useIsMobile } from "@/hooks/use-mobile";
import MobileSidebar from "@/components/dashboard/MobileSidebar";
import { Menu } from "lucide-react";

const Contracts = () => {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((open) => !open);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      {isMobile ? (
        <>
          <MobileSidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar}>
            <Sidebar />
          </MobileSidebar>
          {/* Botão de menu/hambúrguer */}
          <button
            className="fixed top-4 left-4 z-40 bg-white p-2 rounded-md shadow-md lg:hidden"
            onClick={toggleSidebar}
            aria-label="Abrir menu"
          >
            <Menu className="h-6 w-6 text-gray-700" />
          </button>
        </>
      ) : (
        <Sidebar />
      )}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${!isMobile ? "lg:ml-64" : ""}`}>
        <div className="px-2 pt-4 sm:px-4 lg:px-6">
          <DashboardHeader
            title="Meus Contratos"
            description="Visualize e gerencie todos os seus contratos"
          />
        </div>
        {/* <main className="flex-1 container mx-auto px-2 sm:px-4 lg:px-6 py-4 lg:py-8 pb-20 lg:pb-8">
          <ContractsList />
        </main> */}
      </div>
    </div>
  );
};

export default Contracts;
