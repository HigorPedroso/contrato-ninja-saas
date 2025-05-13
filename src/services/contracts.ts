
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Contract {
  content(content: any): unknown;
  id: string;
  title: string;
  client_name: string | null;
  type: string;
  created_at: string;
  status: 'draft' | 'active' | 'expired' | 'canceled' | 'signed';
  signature_status?: 'pending' | 'signed' | 'rejected' | 'expired';
  signature_hash?: string;
  signer_email?: string;
  signed_at?: string;
  client_signed_file_path?: string;
  signed_file_path?: string;
  signature_log?: {
    ip: string;
    timestamp: string;
    method: string;
    hash: string;
  };
}

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
        status,
        client_signed_file_path,
        signed_file_path
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Erro ao carregar contratos:", error);
      toast({
        title: "Erro ao carregar contratos",
        description: "Não foi possível carregar seus contratos. Tente novamente.",
        variant: "destructive",
      });
      return [];
    }

    // Transforma os dados para o formato esperado
    // Update the data mapping
    return (data || []).map(contract => ({
      id: contract.id,
      title: contract.title,
      client_name: contract.client_name,
      type: contract.contract_templates?.template_type || "Personalizado",
      created_at: contract.created_at,
      status: contract.status,
      client_signed_file_path: contract.client_signed_file_path,
      signed_file_path: contract.signed_file_path,
    }));
  } catch (error) {
    console.error("Erro inesperado ao buscar contratos:", error);
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
      console.error("Erro ao carregar modelos de contrato:", error);
      toast({
        title: "Erro ao carregar modelos",
        description: "Não foi possível carregar os modelos de contrato. Tente novamente.",
        variant: "destructive",
      });
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Erro inesperado ao buscar modelos de contrato:", error);
    toast({
      title: "Erro inesperado",
      description: "Ocorreu um erro inesperado. Tente novamente.",
      variant: "destructive",
    });
    return [];
  }
}

export async function fetchContractById(contractId: string) {
  try {
    const { data, error } = await supabase
      .from('contracts')
      .select(`
        id,
        title,
        client_name,
        client_email,
        content,
        status,
        created_at,
        contract_templates(title, template_type)
      `)
      .eq('id', contractId)
      .single();

    if (error) {
      console.error("Erro ao carregar contrato:", error);
      toast({
        title: "Erro ao carregar contrato",
        description: "Não foi possível carregar os detalhes do contrato. Tente novamente.",
        variant: "destructive",
      });
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erro inesperado ao buscar contrato:", error);
    toast({
      title: "Erro inesperado",
      description: "Ocorreu um erro inesperado. Tente novamente.",
      variant: "destructive",
    });
    return null;
  }
}

export async function updateContractStatus(contractId: string, status: 'draft' | 'active' | 'expired' | 'canceled') {
  try {
    const { error } = await supabase
      .from('contracts')
      .update({ status })
      .eq('id', contractId);

    if (error) {
      console.error("Erro ao atualizar status do contrato:", error);
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status do contrato. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }

    toast({
      title: "Status atualizado",
      description: `O contrato foi marcado como ${
        status === 'active' ? 'Ativo' : 
        status === 'draft' ? 'Rascunho' : 
        status === 'expired' ? 'Expirado' : 
        'Cancelado'
      }.`,
    });

    return true;
  } catch (error) {
    console.error("Erro inesperado ao atualizar status do contrato:", error);
    toast({
      title: "Erro inesperado",
      description: "Ocorreu um erro inesperado. Tente novamente.",
      variant: "destructive",
    });
    return false;
  }
}

export async function checkUserSubscription() {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) return false;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('subscription_plan')
      .eq('id', userData.user.id)
      .single();
      
    if (error) throw error;
    
    return data?.subscription_plan === 'premium';
  } catch (error) {
    console.error("Erro ao verificar assinatura:", error);
    return false;
  }
}

// Function to check if the free plan user has reached the contract limit
export async function checkContractLimit(): Promise<{canCreate: boolean, message?: string}> {
  try {
    const isSubscribed = await checkUserSubscription();
    
    // Premium users have unlimited contracts
    if (isSubscribed) {
      return { canCreate: true };
    }
    
    // For free users, check the contract count for the current month
    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return { canCreate: false, message: "Usuário não autenticado" };
    }
    
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);
    
    const { data, error, count } = await supabase
      .from('contracts')
      .select('id', { count: 'exact' })
      .eq('user_id', userData.user.id)
      .gte('created_at', firstDayOfMonth.toISOString());
    
    if (error) {
      console.error("Erro ao verificar limite de contratos:", error);
      return { canCreate: true }; // Allow creation on error, better user experience
    }
    
    const contractCount = count || 0;
    
    if (contractCount >= 3) {
      return { 
        canCreate: false, 
        message: "Você atingiu o limite de 3 contratos por mês no plano gratuito. Assine o plano Premium para criar contratos ilimitados."
      };
    }
    
    return { canCreate: true };
  } catch (error) {
    console.error("Erro ao verificar limite de contratos:", error);
    return { canCreate: true }; // Allow creation on error, better user experience
  }
}
