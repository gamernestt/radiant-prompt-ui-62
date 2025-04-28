
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Message } from "@/types/chat";
import ReactMarkdown from "react-markdown";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  
  return (
    <div className={cn(
      "flex gap-3 p-4",
      isUser ? "bg-secondary/30" : "bg-background"
    )}>
      <div className="shrink-0">
        <Avatar className="h-8 w-8">
          {isUser ? (
            <AvatarFallback className="bg-chat-user text-primary-foreground">
              U
            </AvatarFallback>
          ) : (
            <AvatarFallback 
              className={cn(
                "bg-gradient-to-br from-purple-500 to-indigo-500",
                "text-primary-foreground font-semibold"
              )}
            >
              AI
            </AvatarFallback>
          )}
        </Avatar>
      </div>
      
      <div className="flex-1 space-y-4">
        <div className="prose prose-invert max-w-none">
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
