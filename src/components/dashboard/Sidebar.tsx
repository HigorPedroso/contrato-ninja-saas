
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FileText,
  Plus,
  Home,
  BookOpen,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarLink {
  name: string;
  href: string;
  icon: React.ReactNode;
}

const links: SidebarLink[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: <Home className="h-5 w-5" />,
  },
  {
    name: "Meus Contratos",
    href: "/dashboard/contratos",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    name: "Criar Contrato",
    href: "/dashboard/criar-contrato",
    icon: <Plus className="h-5 w-5" />,
  },
  {
    name: "Modelos Salvos",
    href: "/dashboard/modelos",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    name: "Configurações",
    href: "/dashboard/configuracoes",
    icon: <Settings className="h-5 w-5" />,
  },
  {
    name: "Suporte",
    href: "/dashboard/suporte",
    icon: <HelpCircle className="h-5 w-5" />,
  },
];

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200 w-64 transition-transform duration-300 ease-in-out transform lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Close Button */}
          <div className="lg:hidden absolute top-4 right-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={toggleSidebar}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Logo */}
          <div className="p-6 border-b border-gray-100">
            <Link to="/" className="flex items-center">
              <span className="font-bold text-lg">
                <span className="text-brand-400">Contrato</span>Flash
              </span>
            </Link>
          </div>

          {/* Nav Links */}
          <nav className="flex-1 py-6 px-3 overflow-y-auto">
            <ul className="space-y-1">
              {links.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className={cn(
                      "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      location.pathname === link.href
                        ? "bg-brand-50 text-brand-500"
                        : "text-gray-700 hover:bg-gray-100"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="mr-3">{link.icon}</span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-500 font-medium mr-3">
                MS
              </div>
              <div>
                <p className="font-medium text-sm">Maria Silva</p>
                <p className="text-gray-500 text-xs">Plano Gratuito</p>
              </div>
            </div>
            <Link to="/logout">
              <Button
                variant="ghost"
                className="w-full mt-4 justify-start text-gray-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
