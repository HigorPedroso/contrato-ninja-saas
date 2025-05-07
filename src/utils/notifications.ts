
import { supabase } from "@/integrations/supabase/client";

/**
 * Adiciona uma nova notificação para o usuário
 * @param userId ID do usuário para quem a notificação será enviada
 * @param title Título da notificação
 * @param message Conteúdo da notificação
 * @returns Resultado da operação
 */
export const addNotification = async (
  userId: string,
  title: string,
  message: string
) => {
  try {
    const { data, error } = await supabase.from('notifications').insert({
      user_id: userId,
      title,
      message,
      read: false
    });
    
    if (error) {
      throw error;
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao adicionar notificação:', error);
    return { success: false, error };
  }
};

/**
 * Verifica se o usuário possui notificações não lidas
 * @param userId ID do usuário
 * @returns Booleano indicando se há notificações não lidas
 */
export const hasUnreadNotifications = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('check_unread_notifications', { user_id: userId });
    
    if (error) {
      // Fallback para busca direta
      const { data: notificationsData, error: notificationsError } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('read', false)
        .limit(1);
      
      if (notificationsError) {
        throw notificationsError;
      }
      
      return notificationsData && notificationsData.length > 0;
    }
    
    return data > 0;
  } catch (error) {
    console.error('Erro ao verificar notificações não lidas:', error);
    return false;
  }
};

/**
 * Marca todas as notificações do usuário como lidas
 * @param userId ID do usuário
 * @returns Resultado da operação
 */
export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
    
    if (error) {
      throw error;
    }
    
    return { success: true, data };
  } catch (error) {
    console.error('Erro ao marcar notificações como lidas:', error);
    return { success: false, error };
  }
};
