
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export async function fetchUserNotifications() {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      throw new Error("Usuário não autenticado");
    }

    const { data, error } = await supabase.rpc('get_user_notifications', {
      user_id: userData.user.id
    });

    if (error) {
      console.error("Erro ao buscar notificações:", error);
      return [];
    }

    return data as Notification[];
  } catch (error) {
    console.error("Erro inesperado ao buscar notificações:", error);
    return [];
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId);

    if (error) {
      console.error("Erro ao marcar notificação como lida:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Erro inesperado ao atualizar notificação:", error);
    return false;
  }
}

export async function checkHasUnreadNotifications() {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      return false;
    }

    const { data, error } = await supabase.rpc('check_unread_notifications', {
      user_id: userData.user.id
    });

    if (error) {
      console.error("Erro ao verificar notificações não lidas:", error);
      return false;
    }

    return data > 0;
  } catch (error) {
    console.error("Erro inesperado ao verificar notificações:", error);
    return false;
  }
}
