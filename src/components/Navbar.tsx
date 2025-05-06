
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X, Menu } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

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
            <Link to="/" className="nav-link font-medium">
              Home
            </Link>
            <Link to="/blog" className="nav-link font-medium">
              Blog
            </Link>
            <Link to="/precos" className="nav-link font-medium">
              Preços
            </Link>
            <Link to="/sobre" className="nav-link font-medium">
              Sobre
            </Link>
          </div>

          <div className="flex items-center space-x-4">
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
              className="nav-link font-medium py-2"
              onClick={toggleMenu}
            >
              Home
            </Link>
            <Link
              to="/blog"
              className="nav-link font-medium py-2"
              onClick={toggleMenu}
            >
              Blog
            </Link>
            <Link
              to="/precos"
              className="nav-link font-medium py-2"
              onClick={toggleMenu}
            >
              Preços
            </Link>
            <Link
              to="/sobre"
              className="nav-link font-medium py-2"
              onClick={toggleMenu}
            >
              Sobre
            </Link>
            <div className="flex flex-col space-y-3 pt-3 border-t border-gray-100">
              <Link to="/login" onClick={toggleMenu}>
                <Button variant="outline" className="w-full font-medium">
                  Entrar
                </Button>
              </Link>
              <Link to="/registro" onClick={toggleMenu}>
                <Button className="w-full bg-brand-400 hover:bg-brand-500 text-white font-medium">
                  Criar Conta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
