
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password, {
          name: email.split('@')[0],
        });
        toast({
          title: "Compte créé avec succès",
          description: "Vous pouvez maintenant vous connecter.",
        });
      } else {
        await signIn(email, password);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isSignUp ? "Créer un compte" : "Connexion"}</CardTitle>
          <CardDescription>
            {isSignUp
              ? "Créez votre compte pour accéder à la plateforme"
              : "Connectez-vous à votre compte"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mot de passe</label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? "Chargement..."
                : isSignUp
                ? "Créer un compte"
                : "Se connecter"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              className="text-sm text-blue-600 hover:underline"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp
                ? "Déjà inscrit ? Connectez-vous"
                : "Pas de compte ? Inscrivez-vous"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
