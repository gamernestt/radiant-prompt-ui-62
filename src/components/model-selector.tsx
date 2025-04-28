
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

export function ModelSelector() {
  const { activeModel, setActiveModel } = useChat();
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("sparky_user") || "{}");
    setIsAdmin(userInfo.role === "admin");
    
    if (!userInfo.email) {
      navigate("/auth");
    }
  }, [navigate]);

  const aiModels = [
    { id: "gpt-4o", name: "GPT-4 Turbo", provider: "OpenRouter" },
    { id: "gpt-4o-mini", name: "GPT-4 Mini", provider: "OpenRouter" },
    { id: "claude-3-opus", name: "Claude Opus", provider: "Anthropic" },
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
            className={cn(
              "flex items-center justify-between cursor-pointer rounded-md",
              model.id === activeModel.id && "bg-secondary"
            )}
          >
            <div className="flex flex-col">
              <span className="font-medium">{model.name}</span>
              <span className="text-xs text-muted-foreground">{model.provider}</span>
            </div>
            {model.id === activeModel.id && <CheckIcon className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
