
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GradientText } from "@/components/gradient-text";
import { Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("sparky_user");
    if (isLoggedIn) {
      navigate("/");
    }
  }, [navigate]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!isLogin && password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }
    
    // Mock login/signup for demo purposes
    setTimeout(() => {
      if (isLogin) {
        // In a real app, validate credentials with a backend
        if (email === "admin@sparky.ai" && password === "admin") {
          localStorage.setItem("sparky_user", JSON.stringify({ email, name: "Admin", role: "admin" }));
        } else if (email === "user@sparky.ai" && password === "user") {
          localStorage.setItem("sparky_user", JSON.stringify({ email, name: "User", role: "user" }));
        } else {
          toast({
            title: "Error",
            description: "Invalid credentials. Try admin@sparky.ai/admin or user@sparky.ai/user",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      } else {
        // In a real app, register user with a backend
        localStorage.setItem("sparky_user", JSON.stringify({ email, name, role: "user" }));
      }
      
      toast({
        title: "Success",
        description: isLogin ? "Logged in successfully!" : "Account created successfully!",
      });
      
      navigate("/");
      setIsLoading(false);
    }, 1000);
  };
  
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center mb-4 animate-pulse-subtle">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <GradientText className="text-3xl">Sparky AI</GradientText>
          <p className="text-muted-foreground mt-2">Your intelligent AI assistant</p>
        </div>
        
        <div className="bg-card p-6 rounded-2xl shadow-lg border border-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <GradientText className="text-xl text-center block">
                {isLogin ? "Log in to your account" : "Create a new account"}
              </GradientText>
              
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="rounded-lg"
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-lg"
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
                  className="rounded-lg"
                />
              </div>
              
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="rounded-lg"
                  />
                </div>
              )}
            </div>
            
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-accent to-primary hover:opacity-90 rounded-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="typing-animation">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              ) : isLogin ? (
                "Sign in"
              ) : (
                "Create account"
              )}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </Button>
          </div>
        </div>
        
        <div className="text-center text-xs text-muted-foreground mt-4">
          <p>For demo: admin@sparky.ai / admin or user@sparky.ai / user</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
