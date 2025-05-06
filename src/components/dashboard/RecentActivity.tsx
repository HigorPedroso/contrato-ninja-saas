
import { Link } from "react-router-dom";
import { EyeOff, Clock, Download, FilePen } from "lucide-react";
import { Button } from "@/components/ui/button";

const activities = [
  {
    id: 1,
    type: "download",
    contract: "Contrato de Prestação de Serviços",
    date: "Hoje, 14:32",
    icon: <Download className="h-4 w-4 text-green-500" />,
  },
  {
    id: 2,
    type: "edit",
    contract: "Contrato de Confidencialidade",
    date: "Ontem, 09:15",
    icon: <FilePen className="h-4 w-4 text-amber-500" />,
  },
  {
    id: 3,
    type: "view",
    contract: "Contrato de Design Gráfico",
    date: "Ontem, 08:45",
    icon: <EyeOff className="h-4 w-4 text-purple-500" />,
  },
  {
    id: 4,
    type: "create",
    contract: "Contrato de Consultoria",
    date: "15/04/2025, 16:20",
    icon: <Clock className="h-4 w-4 text-blue-500" />,
  },
  {
    id: 5,
    type: "download",
    contract: "Contrato de Desenvolvimento Web",
    date: "12/04/2025, 11:08",
    icon: <Download className="h-4 w-4 text-green-500" />,
  },
];

const ActivityItem = ({ activity }: { activity: typeof activities[0] }) => {
  const getActivityText = (type: string) => {
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

  return (
    <div className="flex items-center py-3">
      <div className="p-2 rounded-full bg-gray-50 mr-4">{activity.icon}</div>
      <div className="flex-grow">
        <p className="text-sm">
          Você{" "}
          <span className="font-medium">{getActivityText(activity.type)}</span>{" "}
          o <span className="font-medium">{activity.contract}</span>
        </p>
        <p className="text-xs text-gray-500">{activity.date}</p>
      </div>
    </div>
  );
};

const RecentActivity = () => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-medium">Atividade Recente</h2>
      </div>
      <div className="p-6">
        <div className="divide-y divide-gray-100">
          {activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link to="/dashboard/atividades">
            <Button variant="link" className="text-brand-400">
              Ver todas as atividades
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RecentActivity;
