
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Mostra estado de carregamento durante a verificação de autenticação
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-400"></div>
      </div>
    );
  }

  // Redireciona para login se não estiver autenticado
  if (!user) {
    // Salva a URL tentada para redirecionamento após login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Renderiza a rota protegida
  return <Outlet />;
};

export default ProtectedRoute;
