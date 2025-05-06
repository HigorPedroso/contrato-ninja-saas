
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ContractForm from "@/components/dashboard/ContractForm";

const CreateContract = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 lg:ml-64">
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
