import { useEffect, useState } from "react";
import { FileText, Users, Clock, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const DashboardStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    contratos: { valor: "0", mudanca: "+0%", direcao: "none" },
    downloads: { valor: "0", mudanca: "+0%", direcao: "none" },
    clientes: { valor: "0", mudanca: "+0%", direcao: "none" },
    economia: { valor: "0h", mudanca: "", direcao: "none" },
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        // Buscar número de contratos
        const { data: contratos, count: contratosCount, error: contratosError } = await supabase
          .from("contracts")
          .select("*", { count: "exact" })
          .eq("user_id", user.id);

        // Buscar número de clientes únicos
        const { data: clientes, error: clientesError } = await supabase
          .from("contracts")
          .select("client_email")
          .eq("user_id", user.id)
          .not("client_email", "is", null);

        // Número estimado de downloads (baseado em visualizações de contrato com status concluído)
        const { count: downloadsCount, error: downloadsError } = await supabase
          .from("activities")
          .select("*", { count: "exact" })
          .eq("user_id", user.id)
          .eq("type", "download");

        // Calcular estatísticas
        const contratosTotal = contratosCount || 0;
        
        // Remover emails duplicados para ter o número real de clientes
        const clientesUnicos = clientes ? new Set(clientes.map(c => c.client_email)).size : 0;
        
        const downloadsTotal = downloadsCount || 0;
        
        // Economia de tempo estimada (assumindo que cada contrato economiza 2 horas)
        const economiaHoras = contratosTotal * 2;

        // Get last month's date range
        const today = new Date();
        const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        
        // Get last month's stats
        const { count: lastMonthContratos } = await supabase
          .from("contracts")
          .select("*", { count: "exact" })
          .eq("user_id", user.id)
          .gte("created_at", firstDayLastMonth.toISOString())
          .lte("created_at", lastDayLastMonth.toISOString());

        const { count: lastMonthDownloads } = await supabase
          .from("activities")
          .select("*", { count: "exact" })
          .eq("user_id", user.id)
          .eq("type", "download")
          .gte("created_at", firstDayLastMonth.toISOString())
          .lte("created_at", lastDayLastMonth.toISOString());

        const { data: lastMonthClientes } = await supabase
          .from("contracts")
          .select("client_email")
          .eq("user_id", user.id)
          .not("client_email", "is", null)
          .gte("created_at", firstDayLastMonth.toISOString())
          .lte("created_at", lastDayLastMonth.toISOString());

        // Calculate percentage changes
        const calcPercentChange = (current: number, previous: number) => {
          if (previous === 0) return { mudanca: "+100%", direcao: "up" };
          const change = ((current - previous) / previous) * 100;
          return {
            mudanca: `${change > 0 ? "+" : ""}${Math.round(change)}%`,
            direcao: change > 0 ? "up" : change < 0 ? "down" : "none"
          };
        };

        const lastMonthClientesUnicos = lastMonthClientes ? new Set(lastMonthClientes.map(c => c.client_email)).size : 0;

        setStats({
          contratos: { 
            valor: contratosTotal.toString(),
            ...calcPercentChange(contratosTotal, lastMonthContratos || 0)
          },
          downloads: { 
            valor: downloadsTotal.toString(),
            ...calcPercentChange(downloadsTotal, lastMonthDownloads || 0)
          },
          clientes: { 
            valor: clientesUnicos.toString(),
            ...calcPercentChange(clientesUnicos, lastMonthClientesUnicos)
          },
          economia: { 
            valor: `${economiaHoras}h`,
            mudanca: "",
            direcao: "none"
          },
        });
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
      }
    };

    fetchStats();
  }, [user]);

  const statsItems = [
    {
      name: "Contratos Ativos",
      value: stats.contratos.valor,
      icon: <FileText className="h-5 w-5 text-brand-400" />,
      change: stats.contratos.mudanca,
      changeDirection: stats.contratos.direcao,
    },
    {
      name: "Downloads Realizados",
      value: stats.downloads.valor,
      icon: <Download className="h-5 w-5 text-green-500" />,
      change: stats.downloads.mudanca,
      changeDirection: stats.downloads.direcao,
    },
    {
      name: "Clientes Registrados",
      value: stats.clientes.valor,
      icon: <Users className="h-5 w-5 text-indigo-500" />,
      change: stats.clientes.mudanca,
      changeDirection: stats.clientes.direcao,
    },
    {
      name: "Economia de Tempo",
      value: stats.economia.valor,
      icon: <Clock className="h-5 w-5 text-amber-500" />,
      change: stats.economia.mudanca,
      changeDirection: stats.economia.direcao,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsItems.map((stat) => (
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
