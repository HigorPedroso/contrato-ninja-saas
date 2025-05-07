
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

const DashboardHeader = ({ title, description }: DashboardHeaderProps) => {
  const { toast } = useToast();
  const { hasNotifications, refreshProfile } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const handleNotificationClick = async () => {
    try {
      setLoadingNotifications(true);
      
      // Aqui você implementaria a lógica para buscar notificações recentes
      // Como pode ser uma tabela mock, vamos apenas criar algumas notificações de exemplo
      const mockNotifications = [
        {
          id: "1",
          title: "Contrato criado",
          message: "Seu novo contrato foi criado com sucesso.",
          time: "Há 5 minutos"
        },
        {
          id: "2",
          title: "Plano atualizado",
          message: "Sua assinatura foi atualizada para o plano Premium.",
          time: "Há 3 horas"
        },
        {
          id: "3",
          title: "Recurso desbloqueado",
          message: "Agora você tem acesso a todos os modelos premium.",
          time: "Há 1 dia"
        }
      ];
      
      setNotifications(mockNotifications);
      setShowNotifications(true);
      
      // Marca notificações como lidas no contexto de autenticação
      await refreshProfile();
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const closeNotificationsPanel = () => {
    setShowNotifications(false);
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
                        <div className="text-xs text-gray-400 mt-1">{notification.time}</div>
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
