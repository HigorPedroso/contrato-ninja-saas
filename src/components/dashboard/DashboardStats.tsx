
import { FileText, Users, Clock, Download } from "lucide-react";

const stats = [
  {
    name: "Contratos Ativos",
    value: "12",
    icon: <FileText className="h-5 w-5 text-brand-400" />,
    change: "+20%",
    changeDirection: "up",
  },
  {
    name: "Downloads Realizados",
    value: "48",
    icon: <Download className="h-5 w-5 text-green-500" />,
    change: "+35%",
    changeDirection: "up",
  },
  {
    name: "Clientes Registrados",
    value: "8",
    icon: <Users className="h-5 w-5 text-indigo-500" />,
    change: "+12%",
    changeDirection: "up",
  },
  {
    name: "Economia de Tempo",
    value: "43h",
    icon: <Clock className="h-5 w-5 text-amber-500" />,
    change: "",
    changeDirection: "none",
  },
];

const DashboardStats = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow animate-fade-in"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 rounded-full bg-gray-50">{stat.icon}</div>
            {stat.change && (
              <span
                className={`text-sm ${
                  stat.changeDirection === "up"
                    ? "text-green-600"
                    : stat.changeDirection === "down"
                    ? "text-red-600"
                    : "text-gray-500"
                }`}
              >
                {stat.change}
              </span>
            )}
          </div>
          <h3 className="text-2xl font-semibold">{stat.value}</h3>
          <p className="text-gray-500">{stat.name}</p>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
