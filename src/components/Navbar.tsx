
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGoogleAds } from "@/hooks/useGoogleAds";
const { trackConversion } = useGoogleAds();

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();
  

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    trackConversion('AW-960025532');
  })

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold">
            <Link to="/">
              <span className="text-brand-400">Contrato</span>Flash
            </Link>
          </div>

          <div className="lg:hidden">
            <button onClick={toggleMenu}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          <div
            className={`hidden lg:flex items-center space-x-6`}
          >
            <Link to="/" className="hover:text-gray-500">
              Início
            </Link>
            <Link to="/modelos" className="hover:text-gray-500">
              Modelos
            </Link>
            <Link to="/blog" className="hover:text-gray-500">
              Blog
            </Link>

            {user ? (
              <>
                <Link to="/dashboard" className="hover:text-gray-500">
                  Dashboard
                </Link>
                <Button variant="outline" size="sm" onClick={signOut}>
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/registro">
                  <Button size="sm">Registro</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobile && isMenuOpen && (
        <div className="bg-gray-50 p-4">
          <Link to="/" className="block py-2 hover:text-gray-500">
            Início
          </Link>
          <Link to="/modelos" className="block py-2 hover:text-gray-500">
            Modelos
          </Link>
          <Link to="/blog" className="block py-2 hover:text-gray-500">
            Blog
          </Link>

          {user ? (
            <>
              <Link to="/dashboard" className="block py-2 hover:text-gray-500">
                Dashboard
              </Link>
              <Button variant="outline" size="sm" className="w-full" onClick={signOut}>
                Sair
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="block py-2 hover:text-gray-500">
                Login
              </Link>
              <Link to="/registro" className="block py-2">
                <Button className="w-full">Registro</Button>
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
