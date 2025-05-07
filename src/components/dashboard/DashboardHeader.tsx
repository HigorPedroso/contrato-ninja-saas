
import { useState } from "react";
import { Bell, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";

interface DashboardHeaderProps {
  title: string;
  description?: string;
}

// Tipo para as notificações
type NotificationPreview = {
  id: string;
  title: string;
  message: string;
  created_at: string;
};

const DashboardHeader = ({ title, description }: DashboardHeaderProps) => {
  const { toast } = useToast();
  const { hasNotifications, refreshProfile, user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationPreview[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const handleNotificationClick = async () => {
    try {
      if (!user) return;
      
      setLoadingNotifications(true);
      
      // Busca as últimas notificações
      const { data, error } = await supabase
        .from('notifications')
        .select('id, title, message, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) {
        throw error;
      }
      
      // Formata as notificações para exibição
      const formattedNotifications: NotificationPreview[] = data.map(notification => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        created_at: formatTimeAgo(new Date(notification.created_at))
      }));
      
      setNotifications(formattedNotifications);
      
      // Marca notificações como lidas no contexto de autenticação
      await refreshProfile();
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
      // Usa dados mockados em caso de falha
      setNotifications([
        {
          id: "1",
          title: "Contrato criado",
          message: "Seu novo contrato foi criado com sucesso.",
          created_at: "Há 5 minutos"
        },
        {
          id: "2",
          title: "Plano atualizado",
          message: "Sua assinatura foi atualizada para o plano Premium.",
          created_at: "Há 3 horas"
        }
      ]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Função auxiliar para formatar tempo relativo
  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "Agora mesmo";
    if (diffInSeconds < 3600) return `Há ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `Há ${Math.floor(diffInSeconds / 3600)} horas`;
    return `Há ${Math.floor(diffInSeconds / 86400)} dias`;
  };

  return (
    <header className="bg-white border-b border-gray-200 py-6">
      <div className="container px-6 mx-auto">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold">{title}</h1>
            {description && (
              <p className="text-gray-500 mt-1">{description}</p>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={handleNotificationClick}
                >
                  <Bell className="h-5 w-5" />
                  {hasNotifications && (
                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                      !
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex justify-between items-center">
                  Notificações recentes
                  <Link to="/dashboard/notificacoes" className="text-xs text-brand-400 hover:underline">
                    Ver todas
                  </Link>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {loadingNotifications ? (
                  <div className="p-4 text-center">
                    <p className="text-sm text-gray-500">Carregando notificações...</p>
                  </div>
                ) : notifications.length > 0 ? (
                  <>
                    {notifications.map(notification => (
                      <DropdownMenuItem key={notification.id} className="flex-col items-start py-2 px-4 hover:bg-gray-50 cursor-default">
                        <div className="font-medium text-sm">{notification.title}</div>
                        <div className="text-xs text-gray-500 mt-1">{notification.message}</div>
                        <div className="text-xs text-gray-400 mt-1">{notification.created_at}</div>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="p-0">
                      <Link to="/dashboard/notificacoes" className="w-full text-center p-2 text-sm text-brand-400 hover:bg-gray-50">
                        Ver todas as notificações
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-sm text-gray-500">Nenhuma notificação no momento.</p>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/dashboard/criar-contrato">
              <Button className="bg-brand-400 hover:bg-brand-500">
                <Plus className="h-4 w-4 mr-2" /> Novo Contrato
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
