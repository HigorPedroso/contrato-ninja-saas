
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ContractsList from "@/components/dashboard/ContractsList";

const Contracts = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 lg:ml-64">
        <DashboardHeader 
          title="Meus Contratos" 
          description="Visualize e gerencie todos os seus contratos" 
        />
        
        <main className="container mx-auto px-6 py-8">
          <ContractsList />
        </main>
      </div>
    </div>
  );
};

export default Contracts;
