
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChat } from "@/contexts/chat-context";
import { Check as CheckIcon, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function ModelSelector() {
  const { activeModel, setActiveModel } = useChat();

  const aiModels = [
    { id: "gpt-4o", name: "GPT-4 Turbo", provider: "OpenRouter" },
    { id: "gpt-4o-mini", name: "GPT-4 Mini", provider: "OpenRouter" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {activeModel.name}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[220px]">
        {aiModels.map((model) => (
          <DropdownMenuItem
            key={model.id}
            onClick={() => setActiveModel(model)}
            className={cn(
              "flex items-center justify-between cursor-pointer",
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
