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
        <Sidebar />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${!isMobile ? "lg:ml-64" : ""}`}>
        <div className="px-2 pt-4 sm:px-4 lg:px-6">
          <DashboardHeader
            title="Meus Contratos"
            description="Visualize e gerencie todos os seus contratos"
          />
        </div>
        {/* <main
          className={`flex-1 w-full max-w-full ${
            isMobile ? "px-2 py-4 pb-24" : "container mx-auto sm:px-4 lg:px-6 py-4 lg:py-8 pb-20 lg:pb-8"
          }`}
        > */}
          <ContractsList />
        {/* </main> */}
      </div>
    </div>
  );
};

export default Contracts;
