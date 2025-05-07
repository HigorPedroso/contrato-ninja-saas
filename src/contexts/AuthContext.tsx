
import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type ProfileType = {
  full_name: string | null;
  email: string | null;
  company_name: string | null;
  subscription_plan: "free" | "basic" | "premium";
  subscription_expires_at: string | null;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: ProfileType | null;
  signOut: () => Promise<void>;
  isSubscribed: boolean;
  refreshProfile: () => Promise<void>;
  hasNotifications: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [hasNotifications, setHasNotifications] = useState(false);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Erro ao buscar perfil:", error);
        return null;
      }

      return data as ProfileType;
    } catch (error) {
      console.error("Erro inesperado ao buscar perfil:", error);
      return null;
    }
  };

  const checkNotifications = async (userId: string) => {
    try {
      // Aqui você implementaria sua lógica de verificação de notificações
      // Este é apenas um exemplo - adapte para sua estrutura de dados
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .eq('read', false)
        .limit(1);
      
      if (!error && data && data.length > 0) {
        setHasNotifications(true);
      } else {
        setHasNotifications(false);
      }
    } catch (error) {
      console.error("Erro ao verificar notificações:", error);
    }
  };

  const refreshProfile = async () => {
    if (!user) return;
    
    const profileData = await fetchUserProfile(user.id);
    if (profileData) {
      setProfile(profileData);
    }
    
    await checkNotifications(user.id);
  };

  useEffect(() => {
    // Configura o listener de estado de autenticação primeiro
    const { data: { subscription }} = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setTimeout(async () => {
            const profileData = await fetchUserProfile(session.user.id);
            if (profileData) {
              setProfile(profileData);
            }
            await checkNotifications(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    // Então verifica a sessão existente
    supabase.auth.getSession().then(({ data: { session }}) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id).then(profileData => {
          if (profileData) {
            setProfile(profileData);
          }
        });
        
        checkNotifications(session.user.id);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Logout realizado com sucesso",
        description: "Você foi desconectado da sua conta."
      });
    } catch (error: any) {
      console.error("Erro ao fazer logout:", error);
      toast({
        title: "Erro ao fazer logout",
        description: error.message || "Ocorreu um erro durante o logout.",
        variant: "destructive",
      });
    }
  };

  const isSubscribed = profile?.subscription_plan === 'premium';

  const value = {
    user,
    session,
    loading,
    profile,
    signOut,
    isSubscribed,
    refreshProfile,
    hasNotifications,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
