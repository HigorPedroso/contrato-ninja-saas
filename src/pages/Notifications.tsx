
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Notification, fetchUserNotifications, markNotificationAsRead } from "@/utils/notifications";
import { useAuth } from "@/contexts/AuthContext";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const { refreshProfile } = useAuth();

  const loadNotifications = async () => {
    setLoading(true);
    const data = await fetchUserNotifications();
    setNotifications(data);
    setLoading(false);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.read) return;

    const success = await markNotificationAsRead(notification.id);
    if (success) {
      // Atualiza localmente o estado de leitura da notificação
      setNotifications((prevNotifications) =>
        prevNotifications.map((item) =>
          item.id === notification.id ? { ...item, read: true } : item
        )
      );
      
      // Atualiza o indicador de notificações no contexto de autenticação
      refreshProfile();
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 lg:ml-64">
        <DashboardHeader 
          title="Notificações" 
          description="Mantenha-se atualizado com as novidades da plataforma" 
        />
        
        <main className="container mx-auto px-6 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium">Suas notificações</h2>
            <Button 
              variant="outline" 
              onClick={loadNotifications}
              disabled={loading}
            >
              Atualizar
            </Button>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-10 h-10 border-4 border-gray-300 border-t-brand-400 rounded-full mx-auto"></div>
                <p className="mt-4 text-gray-600">Carregando notificações...</p>
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`p-4 transition-colors ${
                    notification.read ? 'bg-white' : 'bg-brand-50 border-l-4 border-l-brand-400'
                  }`}
                  onClick={() => handleMarkAsRead(notification)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`text-lg ${notification.read ? 'font-medium' : 'font-semibold'}`}>
                        {notification.title}
                      </h3>
                      <p className="text-gray-600 mt-1">{notification.message}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(notification.created_at)}
                    </span>
                  </div>
                  
                  {!notification.read && (
                    <div className="flex justify-end mt-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-xs"
                      >
                        Marcar como lida
                      </Button>
                    </div>
                  )}
                </Card>
              ))
            ) : (
              <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500">Você não tem notificações</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default NotificationsPage;
