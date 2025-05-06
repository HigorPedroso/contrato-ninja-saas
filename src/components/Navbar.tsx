
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X, Menu, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  // Define available pages
  const availableRoutes = [
    { path: "/", label: "Home", always: true },
    { path: "/blog", label: "Blog", always: true },
    { path: "/precos", label: "Preços", always: true },
    { path: "/dashboard", label: "Dashboard", auth: true },
    { path: "/dashboard/contratos", label: "Meus Contratos", auth: true },
    { path: "/dashboard/criar-contrato", label: "Criar Contrato", auth: true },
    { path: "/login", label: "Entrar", auth: false },
    { path: "/registro", label: "Criar Conta", auth: false },
  ];

  return (
    <nav className="border-b border-gray-100 py-4 bg-white/90 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl">
            <span className="text-brand-400">Contrato</span>Flash
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <div className="flex space-x-6">
            <Link to="/" className={`nav-link font-medium ${location.pathname === '/' ? 'text-brand-400' : ''}`}>
              Home
            </Link>
            <Link to="/blog" className={`nav-link font-medium ${location.pathname === '/blog' ? 'text-brand-400' : ''}`}>
              Blog
            </Link>
            <Link to="/precos" className={`nav-link font-medium ${location.pathname.includes('/precos') ? 'text-brand-400' : ''}`}>
              Preços
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="outline" className="font-medium">
                    Dashboard
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <User size={18} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard/contratos">Meus Contratos</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard/criar-contrato">Criar Contrato</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-500">
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" className="font-medium">
                    Entrar
                  </Button>
                </Link>
                <Link to="/registro">
                  <Button className="bg-brand-400 hover:bg-brand-500 text-white font-medium">
                    Criar Conta
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-500 hover:text-gray-700"
          onClick={toggleMenu}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 animate-slide-down">
          <div className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link
              to="/"
              className={`nav-link font-medium py-2 ${location.pathname === '/' ? 'text-brand-400' : ''}`}
              onClick={closeMenu}
            >
              Home
            </Link>
            <Link
              to="/blog"
              className={`nav-link font-medium py-2 ${location.pathname === '/blog' ? 'text-brand-400' : ''}`}
              onClick={closeMenu}
            >
              Blog
            </Link>
            <Link
              to="/precos"
              className={`nav-link font-medium py-2 ${location.pathname.includes('/precos') ? 'text-brand-400' : ''}`}
              onClick={closeMenu}
            >
              Preços
            </Link>
            
            <div className="flex flex-col space-y-3 pt-3 border-t border-gray-100">
              {user ? (
                <>
                  <Link to="/dashboard" onClick={closeMenu}>
                    <Button className="w-full font-medium bg-brand-400 hover:bg-brand-500">
                      Dashboard
                    </Button>
                  </Link>
                  <Link to="/dashboard/criar-contrato" onClick={closeMenu}>
                    <Button variant="outline" className="w-full font-medium">
                      Criar Contrato
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    className="w-full font-medium text-red-500 justify-start"
                    onClick={() => {
                      handleLogout();
                      closeMenu();
                    }}
                  >
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={closeMenu}>
                    <Button variant="outline" className="w-full font-medium">
                      Entrar
                    </Button>
                  </Link>
                  <Link to="/registro" onClick={closeMenu}>
                    <Button className="w-full bg-brand-400 hover:bg-brand-500 text-white font-medium">
                      Criar Conta
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
