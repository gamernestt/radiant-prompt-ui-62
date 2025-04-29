
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useChat } from "@/contexts/chat-context";
import { Check as CheckIcon, ChevronDown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function ModelSelector() {
  const { activeModel, setActiveModel, availableModels } = useChat();
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      
      if (!data.session) {
        navigate("/auth");
        return;
      }
      
      // Make all logged-in users administrators
      setIsAdmin(true);
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          navigate("/auth");
        } else if (session) {
          setIsAdmin(true);
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

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
      <DropdownMenuContent align="end" className="w-[260px] max-h-[60vh] overflow-y-auto">
        <DropdownMenuLabel>OpenAI Models</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {availableModels.map((model) => (
            <DropdownMenuItem
              key={model.id}
              onClick={() => handleModelChange(model)}
              disabled={!isAdmin}
              className={cn(
                "flex items-center justify-between cursor-pointer rounded-md py-2",
                model.id === activeModel.id && "bg-secondary",
                !isAdmin && "opacity-60 cursor-not-allowed"
              )}
            >
              <div className="flex flex-col">
                <span className="font-medium">{model.name}</span>
                <span className="text-xs text-muted-foreground">{model.id}</span>
              </div>
              {model.id === activeModel.id && <CheckIcon className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        {!isAdmin && (
          <div className="px-2 py-1.5 text-xs text-muted-foreground">
            Only admins can change models
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
