
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Message } from "@/types/chat";
import ReactMarkdown from "react-markdown";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Zap } from "lucide-react";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  
  return (
    <div className={cn(
      "flex gap-4 p-4 animate-fade-in",
      isUser ? "flex-row-reverse justify-end bg-secondary/30" : "bg-background"
    )}>
      <div className="shrink-0 flex items-start">
        <Avatar className={cn(
          "h-8 w-8",
          isUser ? "border-2 border-chat-user" : "sparkle"
        )}>
          {isUser ? (
            <AvatarFallback className="bg-chat-user text-primary-foreground">
              U
            </AvatarFallback>
          ) : (
            <AvatarFallback 
              className={cn(
                "bg-gradient-to-br from-accent to-primary",
                "text-primary-foreground font-semibold"
              )}
            >
              <Zap className="h-4 w-4" />
            </AvatarFallback>
          )}
        </Avatar>
      </div>
      
      <div className={cn(
        "flex-1 space-y-4 max-w-[80%]",
        isUser ? "text-right" : "text-left"
      )}>
        <div className={cn(
          "prose prose-invert max-w-none inline-block p-4 rounded-lg",
          isUser ? 
            "bg-chat-user/20 rounded-tr-none" : 
            "gradient-border bg-background rounded-tl-none"
        )}>
          <ReactMarkdown
            components={{
              code({ className, children }) {
                const match = /language-(\w+)/.exec(className || '');
                
                return match ? (
                  <SyntaxHighlighter
                    language={match[1]}
                    style={atomDark as any}
                    PreTag="div"
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={cn("bg-secondary/60 px-1 py-0.5 rounded", className)}>
                    {children}
                  </code>
                );
              },
              a({ children, ...props }) {
                return (
                  <a className="text-primary underline" target="_blank" rel="noopener noreferrer" {...props}>
                    {children}
                  </a>
                );
              }
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

// Typing animation component to be used in the chat interface
export function TypingAnimation() {
  return (
    <div className="flex gap-4 p-4">
      <div className="shrink-0">
        <Avatar className="h-8 w-8 sparkle">
          <AvatarFallback 
            className="bg-gradient-to-br from-accent to-primary text-primary-foreground font-semibold"
          >
            <Zap className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      </div>
      
      <div className="flex-1 space-y-4">
        <div className="gradient-border bg-background p-4 rounded-lg rounded-tl-none inline-block">
          <div className="typing-animation">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
