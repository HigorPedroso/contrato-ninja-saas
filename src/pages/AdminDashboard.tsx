
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowUpRight, Users, CreditCard, FileText } from "lucide-react";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  Legend, ResponsiveContainer, PieChart, Pie, Cell 
} from "recharts";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

// Interface para posts
interface Post {
  id: string;
  title: string;
  content: string;
  published: boolean;
  author_id: string;
  created_at: string;
  updated_at: string;
}

// Interface para usuários com assinatura
interface SubscribedUser {
  id: string;
  email: string;
  full_name: string;
  subscription_plan: string;
  subscription_expires_at: string | null;
}

// Interface para dados de pagamento
interface PaymentData {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  created_at: string;
  email?: string;
  full_name?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const AdminDashboard = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [subscribedUsers, setSubscribedUsers] = useState<SubscribedUser[]>([]);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const adminEmail = "higor533@gmail.com";
  const navigate = useNavigate();

  // Verificar se o usuário atual é o administrador
  useEffect(() => {
    if (user?.email === adminEmail) {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  // Buscar dados quando o componente é montado
  useEffect(() => {
    const fetchData = async () => {
      if (user?.email !== adminEmail) return;
      
      try {
        setLoading(true);
        
        // Buscar posts do blog
        const { data: postsData, error: postsError } = await supabase
          .from("blog_posts")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (postsError) throw postsError;
        setPosts(postsData || []);
        
        // Buscar usuários com assinatura premium
        const { data: usersData, error: usersError } = await supabase
          .from("profiles")
          .select("*")
          .eq("subscription_plan", "premium");
        
        if (usersError) throw usersError;
        setSubscribedUsers(usersData || []);
        
        // Simular dados de pagamento
        // Na implementação real, você buscaria esses dados da tabela de pagamentos
        const { data: paymentsData, error: paymentsError } = await supabase
          .from("profiles")
          .select(`
            id,
            email,
            full_name,
            subscription_plan,
            subscription_expires_at
          `)
          .eq("subscription_plan", "premium");
          
        if (paymentsError) throw paymentsError;
        
        // Formatar dados de pagamento
        const formattedPayments = (paymentsData || []).map((user) => ({
          id: user.id,
          user_id: user.id,
          amount: 1990, // R$ 19,90
          status: "completed",
          created_at: user.subscription_expires_at 
            ? new Date(new Date(user.subscription_expires_at).getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
            : new Date().toISOString(),
          email: user.email,
          full_name: user.full_name
        }));
        
        setPayments(formattedPayments);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados do dashboard.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  // Dados para gráficos
  const userGrowthData = [
    { name: 'Jan', users: 20 },
    { name: 'Fev', users: 35 },
    { name: 'Mar', users: 45 },
    { name: 'Abr', users: 65 },
    { name: 'Mai', users: 85 },
    { name: 'Jun', users: 95 },
    { name: 'Jul', users: 110 },
  ];

  const revenueData = [
    { name: 'Jan', value: 2000 },
    { name: 'Fev', value: 3500 },
    { name: 'Mar', value: 4500 },
    { name: 'Abr', value: 6500 },
    { name: 'Mai', value: 8500 },
    { name: 'Jun', value: 9500 },
    { name: 'Jul', value: 11000 },
  ];

  const planDistributionData = [
    { name: 'Gratuito', value: 65 },
    { name: 'Premium', value: 35 },
  ];

  // Formatador de moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value / 100);
  };
  
  // Formatador de data
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-red-50 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Acesso Negado</h1>
          <p className="text-gray-600 mb-4">
            Você não tem permissão para acessar esta página.
          </p>
          <Button onClick={() => window.location.href = "/"}>
            Voltar para Home
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 lg:ml-64 p-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-brand-400 mx-auto" />
            <p className="mt-4 text-gray-600">Carregando dados do dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 lg:ml-64">
        <DashboardHeader 
          title="SuperDashboard Admin" 
          description="Painel de controle administrativo para gerenciar o sistema"
        />
        
        <main className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-full bg-blue-100">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold">{subscribedUsers.length}</h3>
              <p className="text-gray-500">Usuários Premium</p>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-full bg-green-100">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold">
                {formatCurrency(payments.length * 1990)}
              </h3>
              <p className="text-gray-500">Receita Mensal</p>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-full bg-purple-100">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold">{posts.length}</h3>
              <p className="text-gray-500">Posts no Blog</p>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-full bg-amber-100">
                  <ArrowUpRight className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold">{(subscribedUsers.length / 100 * 35).toFixed(1)}%</h3>
              <p className="text-gray-500">Taxa de Conversão</p>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Crescimento de Usuários</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      name="Usuários"
                      stroke="#8884d8" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-4">Receita Mensal (R$)</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`R$ ${value}`, 'Receita']}
                    />
                    <Legend />
                    <Bar 
                      dataKey="value" 
                      name="Receita (R$)"
                      fill="#44c767" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="p-6 lg:col-span-1">
              <h3 className="text-lg font-medium mb-4">Distribuição de Planos</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={planDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {planDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
            
            <Card className="p-6 lg:col-span-2">
              <h3 className="text-lg font-medium mb-4">Usuários Premium Recentes</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-2">Nome</th>
                      <th className="pb-2">Email</th>
                      <th className="pb-2">Expiração</th>
                      <th className="pb-2">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribedUsers.slice(0, 5).map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="py-3">{user.full_name}</td>
                        <td className="py-3">{user.email}</td>
                        <td className="py-3">
                          {user.subscription_expires_at 
                            ? formatDate(user.subscription_expires_at)
                            : "N/A"}
                        </td>
                        <td className="py-3">{formatCurrency(1990)}</td>
                      </tr>
                    ))}
                    
                    {subscribedUsers.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-3 text-center text-gray-500">
                          Nenhum usuário premium encontrado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
          
          {/* After the existing grid sections, add the new posts section */}
          <div className="mt-8">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Posts do Blog</h3>
                <Button
                  onClick={() => navigate('/admin/posts/new')}
                  className="bg-brand-400 hover:bg-brand-500"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Criar Nova Postagem
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-2">Título</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2">Data de Criação</th>
                      <th className="pb-2">Última Atualização</th>
                      <th className="pb-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map((post) => (
                      <tr key={post.id} className="border-b hover:bg-gray-50">
                        <td className="py-3">{post.title}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            post.published 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {post.published ? 'Publicado' : 'Rascunho'}
                          </span>
                        </td>
                        <td className="py-3">{formatDate(post.created_at)}</td>
                        <td className="py-3">{formatDate(post.updated_at)}</td>
                        <td className="py-3 space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/blog/${post.title.toLowerCase()
                              .replace(/[^\w\s-]/g, '')
                              .replace(/\s+/g, '-')}`, '_blank')}
                          >
                            Visualizar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/posts/edit/${post.id}`)}
                          >
                            Editar
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {posts.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-3 text-center text-gray-500">
                          Nenhum post encontrado
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
