import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LogIn, UserPlus, Mail, Lock, KeyRound, ArrowLeft } from "lucide-react";

type Mode = "login" | "signup" | "forgot";

const Auth = () => {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "Login realizado com sucesso!" });
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/#/` },
        });
        if (error) throw error;
        toast({ title: "Conta criada com sucesso!", description: "Você já pode usar o sistema." });
      } else {
        // forgot password
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/#/reset-password`,
        });
        if (error) throw error;
        toast({
          title: "Email enviado!",
          description: "Verifique sua caixa de entrada para redefinir a senha.",
        });
        setMode("login");
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const titles: Record<Mode, { icon: JSX.Element; title: string; desc: string; cta: string }> = {
    login: {
      icon: <LogIn className="w-6 h-6" />,
      title: "Entrar",
      desc: "Faça login para acessar o gerador de roteiros",
      cta: "Entrar",
    },
    signup: {
      icon: <UserPlus className="w-6 h-6" />,
      title: "Criar Conta",
      desc: "Crie sua conta para começar a gerar roteiros",
      cta: "Criar Conta",
    },
    forgot: {
      icon: <KeyRound className="w-6 h-6" />,
      title: "Recuperar Senha",
      desc: "Enviaremos um link para redefinir sua senha",
      cta: "Enviar link",
    },
  };

  const current = titles[mode];

  return (
    <div className="min-h-screen bg-gradient-dark flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            {current.icon}
            {current.title}
          </CardTitle>
          <CardDescription>{current.desc}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {mode !== "forgot" && (
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Senha
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
                  required
                />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Aguarde..." : current.cta}
            </Button>
          </form>

          <div className="mt-4 flex flex-col gap-2 text-center text-sm">
            {mode === "login" && (
              <>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setMode("forgot")}
                >
                  Esqueceu sua senha?
                </button>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setMode("signup")}
                >
                  Não tem conta? Cadastre-se
                </button>
              </>
            )}
            {mode === "signup" && (
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMode("login")}
              >
                Já tem conta? Faça login
              </button>
            )}
            {mode === "forgot" && (
              <button
                type="button"
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1"
                onClick={() => setMode("login")}
              >
                <ArrowLeft className="w-3 h-3" /> Voltar para login
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
