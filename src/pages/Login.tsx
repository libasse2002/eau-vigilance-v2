
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { DropletIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function Login() {
  const { user, login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  
  // If user is already logged in, redirect to dashboard
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Simple validation
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    
    const success = await login(email, password);
    
    if (!success) {
      setError("Invalid email or password");
    }
  };
  
  // Demo account credentials
  const demoAccounts = [
    { role: "Admin", email: "admin@eau-vigilance.com", password: "password" },
    { role: "Site Agent", email: "agent@eau-vigilance.com", password: "password" },
    { role: "External Supervisor", email: "external@eau-vigilance.com", password: "password" },
    { role: "Internal Supervisor", email: "internal@eau-vigilance.com", password: "password" },
    { role: "Director", email: "director@eau-vigilance.com", password: "password" },
    { role: "Professor", email: "professor@eau-vigilance.com", password: "password" },
  ];
  
  const loginAsDemoUser = async (demoEmail: string) => {
    await login(demoEmail, "password");
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-cyan-50 to-blue-100">
      <div className="absolute top-4 left-4 flex items-center space-x-2">
        <DropletIcon className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold text-primary">Eau Vigilance</span>
      </div>
      
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-primary/10">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Login</CardTitle>
            <CardDescription className="text-center">
              Access the water quality monitoring platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email" 
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password"
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && (
                <div className="text-sm text-red-500 mt-2">{error}</div>
              )}
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Logging in...
                  </span>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <div className="text-sm text-muted-foreground mb-2">
              Quick access with demo accounts:
            </div>
            <div className="grid grid-cols-2 gap-2 w-full">
              {demoAccounts.map((account) => (
                <Button 
                  key={account.email} 
                  variant="outline" 
                  size="sm"
                  onClick={() => loginAsDemoUser(account.email)}
                  className="text-xs"
                >
                  {account.role}
                </Button>
              ))}
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
