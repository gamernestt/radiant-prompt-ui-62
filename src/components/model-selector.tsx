
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChat } from "@/contexts/chat-context";
import { Check as CheckIcon, ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function ModelSelector() {
  const { activeModel, setActiveModel } = useChat();
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        navigate("/auth");
        return;
      }
      
      // Check if user is admin (email is admin@sparky.ai)
      setIsAdmin(data.session.user.email === "admin@sparky.ai");
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          navigate("/auth");
        } else if (session) {
          setIsAdmin(session.user.email === "admin@sparky.ai");
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const aiModels = [
    { id: "openai/gpt-4o", name: "GPT-4 Turbo", provider: "OpenAI" },
    { id: "openai/gpt-4o-mini", name: "GPT-4 Mini", provider: "OpenAI" },
    { id: "anthropic/claude-3-opus", name: "Claude 3 Opus", provider: "Anthropic" },
    { id: "anthropic/claude-3-sonnet", name: "Claude 3 Sonnet", provider: "Anthropic" },
    { id: "google/gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "Google" },
  ];

  const handleModelChange = (model: any) => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only administrators can change AI models.",
        variant: "destructive",
      });
      return;
    }
    
    setActiveModel(model);
    toast({
      title: "Model changed",
      description: `Now using ${model.name} by ${model.provider}`,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent/10 to-primary/10"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          {activeModel.name}
          <ChevronDown className="h-4 w-4 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px] rounded-lg">
        {aiModels.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => handleModelChange(model)}
            disabled={!isAdmin}
            className={cn(
              "flex items-center justify-between cursor-pointer rounded-md",
              model.id === activeModel.id && "bg-secondary",
              !isAdmin && "opacity-60 cursor-not-allowed"
            )}
          >
            <div className="flex flex-col">
              <span className="font-medium">{model.name}</span>
              <span className="text-xs text-muted-foreground">{model.provider}</span>
            </div>
            {model.id === activeModel.id && <CheckIcon className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
        {!isAdmin && (
          <div className="px-2 py-1.5 text-xs text-muted-foreground">
            Only admins can change models
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
