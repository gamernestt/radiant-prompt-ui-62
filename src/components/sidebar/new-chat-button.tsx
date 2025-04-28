
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChat } from "@/contexts/chat-context";
import { useIsMobile } from "@/hooks/use-mobile";

interface NewChatButtonProps {
  onToggle?: () => void;
}

export function NewChatButton({ onToggle }: NewChatButtonProps) {
  const { createNewChat } = useChat();
  const isMobile = useIsMobile();
  
  const handleClick = () => {
    createNewChat();
    if (isMobile && onToggle) {
      onToggle();
    }
  };
  
  return (
    <div className="flex flex-col gap-2 p-2">
      <Button 
        onClick={handleClick}
        className="flex gap-2 items-center justify-start bg-gradient-to-r from-accent to-primary hover:opacity-90"
      >
        <Plus className="h-4 w-4" />
        New Chat
      </Button>
    </div>
  );
}
