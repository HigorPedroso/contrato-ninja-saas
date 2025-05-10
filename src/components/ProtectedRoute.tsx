
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute = ({ children, adminOnly = false }: ProtectedRouteProps) => {
  const { user, loading, profile } = useAuth();
  const location = useLocation();

  // Mostra estado de carregamento durante a verificação de autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-brand-400 mx-auto" />
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Redireciona para login se não estiver autenticado
  if (!user) {
    // Salva a URL tentada para redirecionamento após login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Verifica se é uma rota de admin e se o usuário tem permissão
  if (adminOnly && profile?.subscription_plan !== 'premium') {
    return <Navigate to="/dashboard" replace />;
  }

  // Renderiza o conteúdo protegido
  return <>{children}</>;
};

export default ProtectedRoute;
