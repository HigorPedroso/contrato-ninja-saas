import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronLeft, ChevronRight, Mail, Lock, UserPlus, LogIn, ArrowRight } from "lucide-react";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

const BENEFITS = [
  {
    title: "Contratos em minutos",
    desc: "Crie, envie e assine contratos digitais de forma simples e rápida, direto do seu celular.",
    icon: <LogIn className="h-6 w-6 text-brand-400" />,
  },
  {
    title: "Segurança e validade jurídica",
    desc: "Seus contratos são protegidos e têm validade legal, com assinatura digital e registro.",
    icon: <Lock className="h-6 w-6 text-brand-400" />,
  },
  {
    title: "Gestão fácil",
    desc: "Acompanhe o status dos seus contratos e receba notificações em tempo real.",
    icon: <Mail className="h-6 w-6 text-brand-400" />,
  },
];

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [carousel, setCarousel] = useState(0);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const redirectTo = location.state?.from?.pathname || "/dashboard";
      navigate(redirectTo, { replace: true });
    }
  }, [user, navigate, location]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para o dashboard...",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Verifique suas credenciais e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "https://contratoflash.com.br/dashboard",
        },
      });

      if (error) throw error;

      toast({
        title: "Redirecionando para autenticação do Google",
        description: "Você será redirecionado para fazer login com sua conta Google.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login com Google",
        description: error.message || "Ocorreu um erro durante a autenticação.",
        variant: "destructive",
      });
    }
  };

  // Mobile carousel navigation
  const nextBenefit = () => setCarousel((c) => (c + 1) % BENEFITS.length);
  const prevBenefit = () => setCarousel((c) => (c - 1 + BENEFITS.length) % BENEFITS.length);

  return (
    <>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-brand-50 to-white">
        {/* Navbar global */}
        <Navbar />

        {/* Carousel de benefícios */}
        <div className="flex-1 flex flex-col items-center justify-center px-4 mt-6 mb-6">
          <div className="w-full max-w-xs md:max-w-md lg:max-w-lg mx-auto mb-8">
            <div className="relative bg-white rounded-xl shadow-lg p-5 text-center border border-gray-100">
              <div className="flex items-center justify-center mb-2">
                {BENEFITS[carousel].icon}
              </div>
              <h2 className="font-semibold text-lg text-gray-900 mb-1">{BENEFITS[carousel].title}</h2>
              <p className="text-gray-500 text-sm">{BENEFITS[carousel].desc}</p>
              <div className="flex justify-between mt-4">
                <button
                  aria-label="Anterior"
                  className="p-2 rounded-full hover:bg-brand-50 transition"
                  onClick={prevBenefit}
                >
                  <ChevronLeft className="h-5 w-5 text-brand-400" />
                </button>
                <button
                  aria-label="Próximo"
                  className="p-2 rounded-full hover:bg-brand-50 transition"
                  onClick={nextBenefit}
                >
                  <ChevronRight className="h-5 w-5 text-brand-400" />
                </button>
              </div>
            </div>
          </div>

          {/* Card de login */}
          <Card className="w-full max-w-xs md:max-w-md lg:max-w-lg mx-auto shadow-xl border-0 mb-8">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-brand-400">Entrar</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-gray-700">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-gray-700">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-brand-400 hover:bg-brand-500 text-white font-semibold"
                  disabled={loading}
                >
                  {loading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
              <Button
                className="w-full mt-4 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 gap-2"
                onClick={handleGoogleLogin}
                type="button"
              >
                <img src="/google.png" alt="" className="h-5 w-5" />
                Entrar com Google
              </Button>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <div className="text-sm text-center">
                <span className="text-gray-600">Não tem uma conta?</span>{" "}
                <Link to="/registro" className="text-brand-400 font-semibold hover:underline">
                  Criar conta <ArrowRight className="inline h-4 w-4" />
                </Link>
              </div>
              <div className="text-xs text-center">
                <Link to="/" className="text-gray-400 hover:text-brand-400">
                  Voltar para a página inicial
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default Login;
