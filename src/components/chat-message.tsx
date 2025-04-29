
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Message } from "@/types/chat";
import ReactMarkdown from "react-markdown";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Zap } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isMobile = useIsMobile();
  
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
        "flex-1 space-y-4",
        isMobile ? "max-w-[90%]" : "max-w-[80%]",
        isUser ? "text-right" : "text-left"
      )}>
        <div className={cn(
          "prose prose-invert max-w-none inline-block p-4 rounded-lg",
          isUser ? 
            "bg-chat-user/20 rounded-tr-none" : 
            "animate-pulse-border rounded-tl-none"
        )}>
          <ReactMarkdown
            components={{
              code({ className, children }) {
                const match = /language-(\w+)/.exec(className || '');
                
                return match ? (
                  <div className="relative overflow-hidden rounded-md">
                    <ScrollArea className={cn(
                      "w-full overflow-auto",
                      isMobile ? "max-w-[calc(100vw-8rem)]" : ""
                    )}>
                      <SyntaxHighlighter
                        language={match[1]}
                        style={atomDark as any}
                        PreTag="div"
                        customStyle={{
                          margin: 0,
                          borderRadius: '0.375rem',
                          padding: '1rem',
                          fontSize: isMobile ? '0.8rem' : '0.9rem',
                        }}
                        codeTagProps={{
                          style: {
                            fontFamily: 'monospace',
                            whiteSpace: 'pre',
                          }
                        }}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    </ScrollArea>
                    {isMobile && (
                      <div className="absolute bottom-1 right-2 text-[10px] text-gray-400 bg-black/50 px-1 rounded">
                        swipe to scroll →
                      </div>
                    )}
                  </div>
                ) : (
                  <code className={cn("bg-secondary/60 px-1 py-0.5 rounded break-words", className)}>
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
              },
              p({ children }) {
                return (
                  <p className="whitespace-pre-wrap break-words">
                    {children}
                  </p>
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
        <div className="animate-pulse-border p-4 rounded-lg rounded-tl-none inline-block">
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
