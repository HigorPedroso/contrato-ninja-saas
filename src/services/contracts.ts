
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type Contract = {
  id: string;
  title: string;
  client_name: string | null;
  type: string;
  created_at: string;
  status: 'draft' | 'active' | 'expired' | 'canceled';
};

export async function fetchUserContracts(): Promise<Contract[]> {
  try {
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        id,
        title,
        client_name,
        contract_templates(template_type),
        created_at,
        status
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching contracts:", error);
      toast({
        title: "Erro ao carregar contratos",
        description: "Não foi possível carregar seus contratos. Tente novamente.",
        variant: "destructive",
      });
      return [];
    }

    // Transform the data to the expected format
    return (data || []).map(contract => ({
      id: contract.id,
      title: contract.title,
      client_name: contract.client_name,
      type: contract.contract_templates?.template_type || "Personalizado",
      created_at: contract.created_at,
      status: contract.status,
    }));
  } catch (error) {
    console.error("Unexpected error fetching contracts:", error);
    toast({
      title: "Erro inesperado",
      description: "Ocorreu um erro inesperado. Tente novamente.",
      variant: "destructive",
    });
    return [];
  }
}

export async function fetchContractTemplates() {
  try {
    const { data, error } = await supabase
      .from('contract_templates')
      .select('*')
      .order('title');

    if (error) {
      console.error("Error fetching contract templates:", error);
      toast({
        title: "Erro ao carregar modelos",
        description: "Não foi possível carregar os modelos de contrato. Tente novamente.",
        variant: "destructive",
      });
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching contract templates:", error);
    toast({
      title: "Erro inesperado",
      description: "Ocorreu um erro inesperado. Tente novamente.",
      variant: "destructive",
    });
    return [];
  }
}
