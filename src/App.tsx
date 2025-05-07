
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "./pages/Home";
import Blog from "./pages/Blog";
import Dashboard from "./pages/Dashboard";
import CreateContract from "./pages/CreateContract";
import Contracts from "./pages/Contracts";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Subscription from "./pages/Subscription";
import BlogPosts from "./pages/BlogPosts";
import Notifications from "./pages/Notifications";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<Home />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Register />} />
            
            {/* Rotas Protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/contratos" element={<Contracts />} />
              <Route path="/dashboard/criar-contrato" element={<CreateContract />} />
              <Route path="/dashboard/assinatura" element={<Subscription />} />
              <Route path="/dashboard/blog" element={<BlogPosts />} />
              <Route path="/dashboard/notificacoes" element={<Notifications />} />
            </Route>
            
            {/* Rota 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
