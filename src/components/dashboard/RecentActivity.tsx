
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { EyeOff, Clock, Download, FilePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Activity {
  id: string;
  type: "download" | "edit" | "view" | "create";
  contract_name: string;
  created_at: string;
}

const getActivityIcon = (type: Activity["type"]) => {
  switch (type) {
    case "download":
      return <Download className="h-4 w-4 text-green-500" />;
    case "edit":
      return <FilePen className="h-4 w-4 text-amber-500" />;
    case "view":
      return <EyeOff className="h-4 w-4 text-purple-500" />;
    case "create":
      return <Clock className="h-4 w-4 text-blue-500" />;
  }
};

const ActivityItem = ({ activity }: { activity: Activity }) => {
  const getActivityText = (type: Activity["type"]) => {
    switch (type) {
      case "download":
        return "baixou";
      case "edit":
        return "editou";
      case "view":
        return "visualizou";
      case "create":
        return "criou";
      default:
        return "atualizou";
    }
  };

  const formattedDate = formatDistanceToNow(new Date(activity.created_at), {
    locale: ptBR,
    addSuffix: true,
  });

  return (
    <div className="flex items-center py-3">
      <div className="p-2 rounded-full bg-gray-50 mr-4">
        {getActivityIcon(activity.type)}
      </div>
      <div className="flex-grow">
        <p className="text-sm">
          Você{" "}
          <span className="font-medium">{getActivityText(activity.type)}</span>{" "}
          o <span className="font-medium">{activity.contract_name}</span>
        </p>
        <p className="text-xs text-gray-500">{formattedDate}</p>
      </div>
    </div>
  );
};

const RecentActivity = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error("User not authenticated");
        }

        const { data, error } = await supabase
          .from("activities")
          .select("*")
          .eq('user_id', user.id)
          .order("created_at", { ascending: false })
          .limit(12);  // Changed from 5 to 12

        if (error) throw error;
        setActivities(data || []);
      } catch (error) {
        console.error("Error fetching activities:", error);
        toast({
          title: "Erro ao carregar atividades",
          description: "Não foi possível carregar o histórico de atividades.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-medium">Atividade Recente</h2>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="text-center text-gray-500">Carregando...</div>
        ) : activities.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {activities.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500">
            Nenhuma atividade recente
          </div>
        )}
        {/* <div className="mt-4 text-center">
          <Link to="/dashboard/atividades">
            <Button variant="link" className="text-brand-400">
              Ver todas as atividades
            </Button>
          </Link>
        </div> */}
      </div>
    </div>
  );
};

export default RecentActivity;
