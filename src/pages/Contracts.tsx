import { useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ContractsList from "@/components/dashboard/ContractsList";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu } from "lucide-react";

const Contracts = () => {
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      {isMobile ? (
        <>
          <button
            className="fixed top-4 left-4 z-50 bg-white p-2 rounded-md shadow-md lg:hidden"
            onClick={toggleSidebar}
          >
            <Menu className="h-6 w-6 text-gray-700" />
          </button>
          <div
            className={`fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity ${
              isSidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
            }`}
            onClick={toggleSidebar}
          ></div>
          <div
            className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform transition-transform ${
              isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <Sidebar />
          </div>
        </>
      ) : (
        <Sidebar />
      )}

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
