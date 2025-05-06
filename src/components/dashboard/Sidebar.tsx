import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Home, FileText, Plus, Users, Settings, LogOut } from "lucide-react";
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

const Sidebar = () => {
  const { signOut } = useAuth();
  
  const handleLogout = async () => {
    await signOut();
    window.location.href = "/";
  };

  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

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

      {/* Sidebar Content */}
      <nav
        className={`px-6 pb-4 flex-grow lg:block ${isMenuOpen ? "block" : "hidden"
          }`}
      >
        <ul className="space-y-2">
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
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
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
              to="/usuarios"
              className={({ isActive }) =>
                `flex items-center space-x-3 py-2 px-4 rounded-lg transition duration-200 ${isActive
                  ? "bg-gray-100 text-brand-500 font-medium"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
              onClick={closeMenu}
            >
              <Users className="h-4 w-4" />
              <span>Usuários</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/configuracoes"
              className={({ isActive }) =>
                `flex items-center space-x-3 py-2 px-4 rounded-lg transition duration-200 ${isActive
                  ? "bg-gray-100 text-brand-500 font-medium"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
              onClick={closeMenu}
            >
              <Settings className="h-4 w-4" />
              <span>Configurações</span>
            </NavLink>
          </li>
        </ul>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 py-2 px-4 rounded-lg transition duration-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 w-full mt-auto"
        >
          <LogOut className="h-4 w-4" />
          <span>Sair</span>
        </button>
      </nav>
    </div>
  );
};

export default Sidebar;
