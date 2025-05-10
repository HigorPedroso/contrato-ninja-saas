
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useMobileMenu } from "@/hooks/use-mobile";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const { isOpen, toggleMenu, closeMenu } = useMobileMenu();
  const [scrolled, setScrolled] = useState(false);

  // Check if the current route is active
  const isActive = (path: string) => location.pathname === path;

  // Listen for scroll events to add shadow on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-white transition-all duration-200 ${
        scrolled ? "shadow-sm" : ""
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center" onClick={closeMenu}>
            <span className="text-2xl font-bold text-gray-900">
              Contra<span className="text-brand-400">to</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                isActive("/")
                  ? "text-brand-400"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={closeMenu}
            >
              Início
            </Link>
            <Link
              to="/modelos"
              className={`text-sm font-medium transition-colors ${
                isActive("/modelos")
                  ? "text-brand-400"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={closeMenu}
            >
              Modelos
            </Link>
            <Link
              to="/blog"
              className={`text-sm font-medium transition-colors ${
                isActive("/blog")
                  ? "text-brand-400"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              onClick={closeMenu}
            >
              Blog
            </Link>
          </nav>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button variant="outline">Dashboard</Button>
                </Link>
                <Button
                  className="bg-brand-400 hover:bg-brand-500"
                  onClick={() => signOut()}
                >
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline">Entrar</Button>
                </Link>
                <Link to="/registro">
                  <Button className="bg-brand-400 hover:bg-brand-500">
                    Criar conta
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-500 hover:text-gray-900 focus:outline-none"
              aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
            >
              {isOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="container mx-auto px-6 py-4 space-y-4">
            <Link
              to="/"
              className={`block text-sm font-medium ${
                isActive("/") ? "text-brand-400" : "text-gray-600"
              }`}
              onClick={closeMenu}
            >
              Início
            </Link>
            <Link
              to="/modelos"
              className={`block text-sm font-medium ${
                isActive("/modelos") ? "text-brand-400" : "text-gray-600"
              }`}
              onClick={closeMenu}
            >
              Modelos
            </Link>
            <Link
              to="/blog"
              className={`block text-sm font-medium ${
                isActive("/blog") ? "text-brand-400" : "text-gray-600"
              }`}
              onClick={closeMenu}
            >
              Blog
            </Link>

            <div className="pt-4 border-t border-gray-100">
              {user ? (
                <div className="flex flex-col space-y-2">
                  <Link to="/dashboard" onClick={closeMenu}>
                    <Button variant="outline" className="w-full">
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    className="bg-brand-400 hover:bg-brand-500 w-full"
                    onClick={() => {
                      signOut();
                      closeMenu();
                    }}
                  >
                    Sair
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link to="/login" onClick={closeMenu}>
                    <Button variant="outline" className="w-full">
                      Entrar
                    </Button>
                  </Link>
                  <Link to="/registro" onClick={closeMenu}>
                    <Button
                      className="bg-brand-400 hover:bg-brand-500 w-full"
                      onClick={closeMenu}
                    >
                      Criar conta
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
