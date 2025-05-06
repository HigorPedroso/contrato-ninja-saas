
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-400"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    // Save the attempted URL for redirection after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render the protected route
  return <Outlet />;
};

export default ProtectedRoute;
