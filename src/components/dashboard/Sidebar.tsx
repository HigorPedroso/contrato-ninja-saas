
import { useState, useEffect } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Home, FileText, Plus, Users, Settings, LogOut, Bell, Newspaper, Shield } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

const Sidebar = () => {
  const { user, signOut, profile, hasNotifications, isSubscribed, refreshProfile } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      refreshProfile();
    }
  }, [user]);
  
  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  
  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    
    return 'U';
  };

  // Check if user is admin (your email)
  const isAdmin = user?.email === 'higor533@gmail.com';

  return (
    <div className="lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col bg-white border-r border-gray-200">
      {/* Branding */}
      <div className="flex items-center justify-between px-6 py-4">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <span className="font-bold text-xl">
            <span className="text-brand-400">Contrato</span>Flash
          </span>
        </Link>
        <button
          className="lg:hidden text-gray-500 hover:text-gray-700"
          onClick={toggleMenu}
        >
          {isMenuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          )}
        </button>
      </div>

      {/* User Profile */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={user?.user_metadata?.avatar_url} alt={profile?.full_name || user?.email || ""} />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium text-gray-900">
              {profile?.full_name || user?.email}
            </span>
            <span className="text-sm text-gray-500">
              {profile?.full_name ? user?.email : ''}
            </span>
            <span className="text-xs font-medium">
              {isSubscribed ? (
                <Badge variant="default" className="bg-brand-400 hover:bg-brand-500">
                  Plano Premium
                </Badge>
              ) : (
                <Badge variant="outline">Plano Gratuito</Badge>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Sidebar Content */}
      <nav
        className={`px-6 pb-4 flex-grow lg:block ${isMenuOpen ? "block" : "hidden"
          }`}
      >
        <ul className="space-y-2 mt-4">
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center space-x-3 py-2 px-4 rounded-lg transition duration-200 ${isActive
                  ? "bg-gray-100 text-brand-500 font-medium"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
              onClick={closeMenu}
              end
            >
              <Home className="h-4 w-4" />
              <span>Painel Principal</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/contratos"
              className={({ isActive }) =>
                `flex items-center space-x-3 py-2 px-4 rounded-lg transition duration-200 ${isActive
                  ? "bg-gray-100 text-brand-500 font-medium"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
              onClick={closeMenu}
            >
              <FileText className="h-4 w-4" />
              <span>Meus Contratos</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/criar-contrato"
              className={({ isActive }) =>
                `flex items-center space-x-3 py-2 px-4 rounded-lg transition duration-200 ${isActive
                  ? "bg-gray-100 text-brand-500 font-medium"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
              onClick={closeMenu}
            >
              <Plus className="h-4 w-4" />
              <span>Criar Contrato</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/dashboard/notificacoes"
              className={({ isActive }) =>
                `flex items-center space-x-3 py-2 px-4 rounded-lg transition duration-200 ${isActive
                  ? "bg-gray-100 text-brand-500 font-medium"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
              onClick={closeMenu}
            >
              <Bell className="h-4 w-4" />
              <span className="flex items-center">
                Notificações
                {hasNotifications && (
                  <span className="ml-2 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </span>
            </NavLink>
          </li>
          {isSubscribed && (
            <li>
              <NavLink
                to="/dashboard/blog"
                className={({ isActive }) =>
                  `flex items-center space-x-3 py-2 px-4 rounded-lg transition duration-200 ${isActive
                    ? "bg-gray-100 text-brand-500 font-medium"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
                onClick={closeMenu}
              >
                <Newspaper className="h-4 w-4" />
                <span>Blog</span>
              </NavLink>
            </li>
          )}
          
          {/* Admin Section - Only visible to your email */}
          {isAdmin && (
            <li className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-2">
                Admin
              </div>
              <NavLink
                to="/admin-dashboard"
                className={({ isActive }) =>
                  `flex items-center space-x-3 py-2 px-4 rounded-lg transition duration-200 ${isActive
                    ? "bg-gray-100 text-brand-500 font-medium"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
                onClick={closeMenu}
              >
                <Shield className="h-4 w-4" />
                <span>Superdashboard</span>
              </NavLink>
            </li>
          )}
        </ul>

        <div className="mt-8 pt-4 border-t border-gray-200">
          <NavLink
            to="/dashboard/assinatura"
            className={({ isActive }) =>
              `flex items-center space-x-3 py-2 px-4 rounded-lg transition duration-200 ${isActive
                ? "bg-gray-100 text-brand-500 font-medium"
                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
            onClick={closeMenu}
          >
            <Settings className="h-4 w-4" />
            <span>Gerenciar Assinatura</span>
          </NavLink>
          
          {/* Botão de Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 py-2 px-4 rounded-lg transition duration-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 w-full mt-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
