
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2, Eye, Edit, FileText, Users, CreditCard, BarChart } from "lucide-react";
import { toast } from "sonner";

type CustomerData = {
  id: string;
  email: string;
  full_name: string;
  subscription_plan: string;
  subscription_expires_at: string | null;
  created_at: string;
}

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  created_at: string;
}

type PaymentData = {
  id: string;
  user_email?: string;
  user_name?: string;
  amount: number;
  status: string;
  payment_date: string | null;
  created_at: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    totalRevenue: 0,
    totalPosts: 0
  });
  
  // Admin check - restrict to your email only
  useEffect(() => {
    if (!user || user.email !== 'higor533@gmail.com') {
      toast.error("Acesso restrito ao administrador");
      navigate("/dashboard");
    } else {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchCustomers(),
        fetchBlogPosts(),
        fetchPayments(),
        fetchStats()
      ]);
    } catch (error) {
      console.error("Error loading admin data:", error);
      toast.error("Erro ao carregar dados administrativos");
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    setCustomers(data || []);
  };

  const fetchBlogPosts = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, published, created_at')
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    setBlogPosts(data || []);
  };
  
  const fetchPayments = async () => {
    // Join profiles to get user details with payments
    const { data: paymentsData, error } = await supabase
      .from('payments')
      .select(`
        *,
        profiles:user_id (
          email,
          full_name
        )
      `)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    const formattedPayments = (paymentsData || []).map((payment) => ({
      id: payment.id,
      user_email: payment.profiles?.email || 'N/A',
      user_name: payment.profiles?.full_name || 'N/A',
      amount: payment.amount,
      status: payment.status,
      payment_date: payment.payment_date,
      created_at: payment.created_at
    }));
    
    setPayments(formattedPayments);
  };

  const fetchStats = async () => {
    // Get total users count
    const { count: userCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    // Get premium users count
    const { count: premiumCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('subscription_plan', 'premium');
    
    // Get total blog posts
    const { count: postsCount } = await supabase
      .from('blog_posts')
      .select('*', { count: 'exact', head: true });
      
    // Calculate total revenue
    const { data: paymentsData } = await supabase
      .from('payments')
      .select('amount')
      .eq('status', 'successful');
      
    const totalRevenue = (paymentsData || []).reduce((sum, payment) => 
      sum + (parseFloat(payment.amount.toString()) || 0), 0);
    
    setStats({
      totalUsers: userCount || 0,
      premiumUsers: premiumCount || 0,
      totalRevenue: totalRevenue,
      totalPosts: postsCount || 0
    });
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch (e) {
      return dateString;
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const getSubscriptionStatusColor = (plan: string, expiresAt: string | null) => {
    if (plan === 'premium') {
      if (!expiresAt || new Date(expiresAt) > new Date()) {
        return "bg-green-100 text-green-800";
      }
      return "bg-amber-100 text-amber-800";
    }
    return "bg-gray-100 text-gray-800";
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'successful':
        return "bg-green-100 text-green-800";
      case 'pending':
        return "bg-amber-100 text-amber-800";
      case 'failed':
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Sidebar />
        <div className="flex-1 lg:ml-64 flex items-center justify-center">
          <div className="text-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-brand-400 mx-auto mb-4" />
            <p className="text-gray-500">Carregando Superdashboard...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Chart data for subscription types
  const subscriptionData = [
    { name: 'Gratuito', value: stats.totalUsers - stats.premiumUsers },
    { name: 'Premium', value: stats.premiumUsers },
  ];
  const COLORS = ['#CBD5E1', '#F59E0B'];
  
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className="flex-1 lg:ml-64">
        <DashboardHeader 
          title="Superdashboard" 
          description="Painel administrativo exclusivo para gerenciamento do sistema" 
        />
        
        <main className="container mx-auto px-6 py-8">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Usuários Totais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-muted-foreground mr-2" />
                  <span className="text-2xl font-bold">{stats.totalUsers}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Usuários Premium
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-muted-foreground mr-2" />
                  <span className="text-2xl font-bold">{stats.premiumUsers}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Receita Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <BarChart className="h-5 w-5 text-muted-foreground mr-2" />
                  <span className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Posts do Blog
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-muted-foreground mr-2" />
                  <span className="text-2xl font-bold">{stats.totalPosts}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Distribution Chart */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Assinaturas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={subscriptionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({name, percent}) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {subscriptionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Tabs for different data views */}
          <Tabs defaultValue="customers" className="space-y-4">
            <TabsList>
              <TabsTrigger value="customers">Clientes</TabsTrigger>
              <TabsTrigger value="blog">Posts do Blog</TabsTrigger>
              <TabsTrigger value="payments">Pagamentos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="customers">
              <Card>
                <CardHeader>
                  <CardTitle>Clientes Registrados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Plano</TableHead>
                          <TableHead>Data de Expiração</TableHead>
                          <TableHead>Registro</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customers.map((customer) => (
                          <TableRow key={customer.id}>
                            <TableCell className="font-medium">
                              {customer.full_name || 'Sem nome'}
                            </TableCell>
                            <TableCell>{customer.email}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                getSubscriptionStatusColor(customer.subscription_plan, customer.subscription_expires_at)
                              }`}>
                                {customer.subscription_plan === 'premium' ? 'Premium' : 'Gratuito'}
                              </span>
                            </TableCell>
                            <TableCell>
                              {customer.subscription_expires_at ? formatDate(customer.subscription_expires_at) : '-'}
                            </TableCell>
                            <TableCell>{formatDate(customer.created_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="blog">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Posts do Blog</CardTitle>
                  <Button 
                    onClick={() => navigate("/dashboard/blog")} 
                    className="bg-brand-400 hover:bg-brand-500"
                  >
                    Gerenciar Posts
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="relative overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Título</TableHead>
                          <TableHead>Slug</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Data de Criação</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {blogPosts.map((post) => (
                          <TableRow key={post.id}>
                            <TableCell className="font-medium">{post.title}</TableCell>
                            <TableCell>{post.slug}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {post.published ? 'Publicado' : 'Rascunho'}
                              </span>
                            </TableCell>
                            <TableCell>{formatDate(post.created_at)}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => navigate(`/dashboard/blog`)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => window.open(`/blog/${post.slug}`, '_blank')}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Pagamentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Cliente</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Data do Pagamento</TableHead>
                          <TableHead>Registro</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell className="font-medium">
                              {payment.user_name}
                            </TableCell>
                            <TableCell>{payment.user_email}</TableCell>
                            <TableCell>{formatCurrency(Number(payment.amount))}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                getPaymentStatusColor(payment.status)
                              }`}>
                                {payment.status === 'successful' ? 'Concluído' : 
                                 payment.status === 'pending' ? 'Pendente' : 
                                 payment.status === 'failed' ? 'Falha' : payment.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              {payment.payment_date ? formatDate(payment.payment_date) : '-'}
                            </TableCell>
                            <TableCell>{formatDate(payment.created_at)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
