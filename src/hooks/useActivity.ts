import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

type ActivityType = "download" | "edit" | "view" | "create";

export const useActivity = () => {
  const trackActivity = async (
    type: ActivityType,
    contractId: string,
    contractName: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { error } = await supabase.from("activities").insert({
        type,
        contract_id: contractId,
        contract_name: contractName,
        user_id: user.id
      });

      if (error) throw error;
      
    } catch (error) {
      console.error("Error tracking activity:", error);
      toast({
        title: "Erro ao registrar atividade",
        description: "Não foi possível registrar esta ação.",
        variant: "destructive",
      });
    }
  };

  return { trackActivity };
};