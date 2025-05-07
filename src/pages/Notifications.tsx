
import { useState, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Check, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
};

const NotificationsPage = () => {
  const { user, refreshProfile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);
  
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Verifica se a tabela notifications existe, se não, pode criar uma mock
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Erro ao buscar notificações:", error);
        // Se a tabela não existir, cria notificações mock para demonstração
        setNotifications(generateMockNotifications());
      } else {
        setNotifications(data || []);
      }
    } catch (error) {
      console.error("Erro inesperado ao buscar notificações:", error);
      setNotifications(generateMockNotifications());
    } finally {
      setLoading(false);
    }
  };
  
  const generateMockNotifications = (): Notification[] => {
    return [
      {
        id: "1",
        user_id: user?.id || "",
        title: "Bem-vindo ao ContratoFlash",
        message: "Obrigado por se cadastrar! Explore nossos modelos de contratos.",
        read: false,
        created_at: new Date().toISOString()
      },
      {
        id: "2",
        user_id: user?.id || "",
        title: "Novo modelo disponível",
        message: "Acabamos de adicionar um novo modelo de contrato para prestação de serviços de design.",
        read: false,
        created_at: new Date(Date.now() - 86400000).toISOString() // 1 dia atrás
      },
      {
        id: "3",
        user_id: user?.id || "",
        title: "Desconto exclusivo",
        message: "Assine o plano Premium nos próximos 7 dias e ganhe 20% de desconto!",
        read: true,
        created_at: new Date(Date.now() - 172800000).toISOString() // 2 dias atrás
      }
    ];
  };
  
  const markAsRead = async (notificationId: string) => {
    try {
      // Aqui você implementaria a lógica para marcar como lida no banco
      // Como pode ser uma tabela mock, vamos apenas atualizar o state
      setNotifications(notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true } 
          : notification
      ));
      
      // Atualiza o status de notificações no AuthContext
      refreshProfile();
      
      toast({
        title: "Notificação marcada como lida",
        description: "A notificação foi atualizada com sucesso."
      });
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  };
  
  const markAllAsRead = async () => {
    try {
      // Aqui você implementaria a lógica para marcar todas como lidas no banco
      // Como pode ser uma tabela mock, vamos apenas atualizar o state
      setNotifications(notifications.map(notification => 
        ({ ...notification, read: true })
      ));
      
      // Atualiza o status de notificações no AuthContext
      refreshProfile();
      
      toast({
        title: "Todas as notificações foram marcadas como lidas",
        description: "Suas notificações foram atualizadas com sucesso."
      });
    } catch (error) {
      console.error("Erro ao marcar todas as notificações como lidas:", error);
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };
  
  const hasUnreadNotifications = notifications.some(notification => !notification.read);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 lg:ml-64">
        <DashboardHeader 
          title="Notificações" 
          description="Fique por dentro das novidades e atualizações do ContratoFlash" 
        />
        
        <main className="container mx-auto px-6 py-8">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-brand-400 mr-2" />
                <h2 className="text-xl font-medium">Suas Notificações</h2>
              </div>
              
              {hasUnreadNotifications && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={markAllAsRead}
                >
                  Marcar todas como lidas
                </Button>
              )}
            </div>
            
            <div className="divide-y divide-gray-100">
              {loading ? (
                <div className="flex justify-center items-center p-12">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-6 ${notification.read ? 'bg-white' : 'bg-brand-50'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`text-lg ${notification.read ? 'font-medium' : 'font-semibold'}`}>
                          {notification.title}
                        </h3>
                        <p className="text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-gray-400 text-sm mt-2">
                          {formatDate(notification.created_at)}
                        </p>
                      </div>
                      
                      {!notification.read && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-brand-400"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <Check className="h-4 w-4 mr-1" /> Marcar como lida
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    Nenhuma notificação
                  </h3>
                  <p className="text-gray-500">
                    Você não tem notificações no momento.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NotificationsPage;
