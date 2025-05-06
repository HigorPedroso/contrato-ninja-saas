
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-100 pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl">
                <span className="text-brand-400">Contrato</span>Flash
              </span>
            </Link>
            <p className="mt-4 text-gray-600">
              Gere contratos jurídicos em minutos.
              <br />
              Simples, rápido e seguro.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-4">Plataforma</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-600 hover:text-brand-400">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/precos" className="text-gray-600 hover:text-brand-400">
                  Preços
                </Link>
              </li>
              <li>
                <Link to="/sobre" className="text-gray-600 hover:text-brand-400">
                  Sobre nós
                </Link>
              </li>
              <li>
                <Link to="/contato" className="text-gray-600 hover:text-brand-400">
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-4">Recursos</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/blog" className="text-gray-600 hover:text-brand-400">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/modelos" className="text-gray-600 hover:text-brand-400">
                  Modelos
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-600 hover:text-brand-400">
                  Perguntas frequentes
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/termos" className="text-gray-600 hover:text-brand-400">
                  Termos de uso
                </Link>
              </li>
              <li>
                <Link to="/privacidade" className="text-gray-600 hover:text-brand-400">
                  Política de privacidade
                </Link>
              </li>
              <li>
                <Link to="/lgpd" className="text-gray-600 hover:text-brand-400">
                  LGPD
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © {currentYear} ContratoFlash. Todos os direitos reservados.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <a
              href="#"
              className="text-gray-500 hover:text-brand-400"
              aria-label="LinkedIn"
            >
              LinkedIn
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-brand-400"
              aria-label="Instagram"
            >
              Instagram
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-brand-400"
              aria-label="Twitter"
            >
              Twitter
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
