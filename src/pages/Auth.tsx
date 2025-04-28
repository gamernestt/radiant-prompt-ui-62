
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GradientText } from "@/components/gradient-text";
import { Zap, Mail, Lock, User, Shield } from "lucide-react"; 
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAdminCreation, setIsAdminCreation] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Admin credentials - these are hardcoded for the demo
  const ADMIN_EMAIL = "admin@sparkyai.com";
  const ADMIN_PASSWORD = "Admin123!";
  const ADMIN_USERNAME = "SparkyAdmin";
  
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        navigate("/");
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  const createAdminUser = async () => {
    setIsLoading(true);
    
    try {
      // Sign up with admin credentials
      const { data, error } = await supabase.auth.signUp({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        options: {
          data: {
            username: ADMIN_USERNAME,
            full_name: "Sparky Admin",
            is_admin: true,
          },
        },
      });
      
      if (error) {
        throw error;
      }
      
      // Auto sign in after signup
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      });
      
      if (signInError) {
        throw signInError;
      }
      
      toast({
        title: "Success",
        description: "Admin account created! You are now logged in as admin.",
      });
      
      navigate("/");
    } catch (error: any) {
      console.error("Admin creation error:", error);
      
      // If admin already exists, just try to log in
      if (error.message.includes("already registered")) {
        toast({
          title: "Admin already exists",
          description: "Trying to log in with admin credentials instead.",
        });
        
        try {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
          });
          
          if (signInError) throw signInError;
          
          toast({
            title: "Success",
            description: "Logged in as admin successfully!",
          });
          
          navigate("/");
          return;
        } catch (loginError: any) {
          toast({
            title: "Login failed",
            description: loginError.message || "Could not log in as admin.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to create admin account",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (!isLogin && password !== confirmPassword) {
        toast({
          title: "Error",
          description: "Passwords do not match",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      if (isLogin) {
        // Login
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          throw error;
        }
        
        toast({
          title: "Success",
          description: "Logged in successfully!",
        });
        
        navigate("/");
      } else {
        // Signup with auto-confirmation (no email verification)
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username,
              full_name: username,
            },
          },
        });
        
        if (error) {
          throw error;
        }
        
        // Auto sign in after signup
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) {
          throw signInError;
        }
        
        toast({
          title: "Success",
          description: "Account created successfully! You are now logged in.",
        });
        
        navigate("/");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      toast({
        title: "Error",
        description: error.message || "Authentication failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4 animate-pulse-subtle">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <GradientText className="text-3xl">Sparky AI</GradientText>
          <p className="text-muted-foreground mt-2">Your intelligent AI assistant</p>
        </div>
        
        <div className="bg-card p-6 rounded-2xl shadow-lg border border-border animate-fade-in">
          {isAdminCreation ? (
            <div className="space-y-6">
              <div className="space-y-4 text-center">
                <Shield className="h-12 w-12 mx-auto text-amber-500" />
                <GradientText className="text-xl block">Admin Account</GradientText>
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Email:</span>
                    <code className="bg-background px-2 py-1 rounded">{ADMIN_EMAIL}</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Password:</span>
                    <code className="bg-background px-2 py-1 rounded">{ADMIN_PASSWORD}</code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Username:</span>
                    <code className="bg-background px-2 py-1 rounded">{ADMIN_USERNAME}</code>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  This will create an admin account with the credentials shown above.
                </p>
              </div>
              
              <div className="space-y-4">
                <Button
                  onClick={createAdminUser}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 rounded-lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="typing-animation">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  ) : (
                    "Create & Login as Admin"
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setIsAdminCreation(false)}
                  className="w-full"
                >
                  Back to Regular Login
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <GradientText className="text-xl text-center block">
                  {isLogin ? "Log in to your account" : "Create a new account"}
                </GradientText>
                
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="username" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Username
                    </Label>
                    <Input
                      id="username"
                      placeholder="Your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="rounded-lg"
                    />
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
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
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Password
                  </Label>
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
                    <Label htmlFor="confirmPassword" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Confirm Password
                    </Label>
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
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 rounded-lg"
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
              
              <div className="flex justify-between items-center mt-4 text-center">
                <Button
                  variant="link"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm"
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </Button>
                
                <Button
                  variant="link"
                  onClick={() => setIsAdminCreation(true)}
                  className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400"
                >
                  Create Admin
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Auth;
