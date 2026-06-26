import { useState, useEffect, useRef, createContext, useContext, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const resolvedRef = useRef(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        resolvedRef.current = true;
        setSession(session);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      resolvedRef.current = true;
      setSession(session);
      setLoading(false);
    }).catch((err) => {
      resolvedRef.current = true;
      console.error("getSession error:", err);
      setLoading(false);
      toast.error("Erro ao verificar sessão. Tente recarregar a página.");
    });

    // Safety timeout — never stay stuck on "Carregando..."
    const timeout = setTimeout(() => {
      if (!resolvedRef.current) {
        setLoading(false);
        toast.error("Tempo esgotado ao verificar sessão. Tente recarregar a página.");
      }
    }, 4000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
