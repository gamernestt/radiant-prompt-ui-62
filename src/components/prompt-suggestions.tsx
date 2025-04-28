
import { Button } from "@/components/ui/button";
import { useChat } from "@/contexts/chat-context";
import { cn } from "@/lib/utils";

const suggestions = [
  "Explain the difference between REST and GraphQL APIs",
  "How can I improve my UI design skills?",
  "Write a poem about programming",
  "What are some tips for effective time management?",
  "Tell me about the latest AI advancements"
];

interface PromptSuggestionsProps {
  onSelectPrompt: (prompt: string) => void;
  className?: string;
}

export function PromptSuggestions({ onSelectPrompt, className }: PromptSuggestionsProps) {
  const { currentChat } = useChat();
  
  // Only show suggestions for new chats with no messages
  if (currentChat?.messages.length && currentChat.messages.length > 0) {
    return null;
  }
  
  return (
    <div className={cn("p-4 space-y-4", className)}>
      <h3 className="text-lg font-medium">Suggested Prompts</h3>
      <div className="flex flex-col gap-2">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="secondary"
            className="justify-start h-auto whitespace-normal text-left"
            onClick={() => onSelectPrompt(suggestion)}
          >
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
}
