
import { useRef, useState } from "react";
import { ArrowUp, Camera, MoreHorizontal, Image, FileText, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChat } from "@/contexts/chat-context";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { VoiceAssistant } from "./voice-assistant";
import { ChatSearch } from "./chat-search";

export function ChatInput() {
  const { sendMessage, isLoading } = useChat();
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const handleSubmit = async () => {
    if (!input.trim()) return;
    
    try {
      await sendMessage(input);
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleOptionClick = (option: string) => {
    toast({
      title: `${option} feature`,
      description: `${option} feature will be available soon!`,
    });
  };

  const handleVoiceTranscript = (text: string) => {
    setInput(text);
    // Focus the textarea after a voice transcript
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="p-4 border-t border-border">
      <div
        className={cn(
          "flex items-end gap-2 rounded-lg border bg-background/95 p-2",
          "shadow-[0_0_15px_rgba(0,0,0,0.1)]",
          "backdrop-blur-sm",
          "transition-colors focus-within:ring-1 focus-within:ring-ring",
          "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-b before:from-primary/5 before:to-transparent before:opacity-50",
          "gradient-border"
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
            >
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuItem onClick={() => handleOptionClick("Photos")}>
              <Image className="mr-2 h-4 w-4" />
              Photos
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleOptionClick("Files")}>
              <FileText className="mr-2 h-4 w-4" />
              Files
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleOptionClick("Camera")}>
              <Camera className="mr-2 h-4 w-4" />
              Camera
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Textarea
          ref={textareaRef}
          placeholder="Message..."
          className="min-h-[60px] flex-1 resize-none border-0 p-2 focus-visible:ring-0"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        
        <div className="flex items-center gap-1">
          <ChatSearch />
          <VoiceAssistant onTranscript={handleVoiceTranscript} isLoading={isLoading} />
          <Button
            size="icon"
            className="h-8 w-8 shrink-0 bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90"
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
