
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
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

  // Renderiza a rota protegida
  return <Outlet />;
};

export default ProtectedRoute;
