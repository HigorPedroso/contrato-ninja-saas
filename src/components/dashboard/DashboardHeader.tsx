
import { useState } from "react";
import { Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface DashboardHeaderProps {
  title: string;
  description?: string;
}

const DashboardHeader = ({ title, description }: DashboardHeaderProps) => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(3);

  const handleNotificationClick = () => {
    toast({
      title: "Notificações",
      description: "Você tem 3 notificações não lidas.",
    });
    setNotifications(0);
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
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={handleNotificationClick}
            >
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
                  {notifications}
                </span>
              )}
            </Button>
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
