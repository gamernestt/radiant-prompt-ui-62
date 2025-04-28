
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
            <AvatarFallback className="bg-chat-ai text-primary-foreground">
              AI
            </AvatarFallback>
          )}
        </Avatar>
      </div>
      
      <div className="flex-1 space-y-4">
        <div className="prose prose-invert max-w-none">
          {message.images && message.images.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {message.images.map((img, i) => (
                <img 
                  key={i}
                  src={img}
                  alt={`Uploaded image ${i+1}`}
                  className="rounded-md max-h-64 object-contain"
                />
              ))}
            </div>
          )}
          
          <ReactMarkdown
            components={{
              code({ node, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return match ? (
                  <SyntaxHighlighter
                    language={match[1]}
                    style={atomDark as any}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={cn("bg-secondary/60 px-1 py-0.5 rounded", className)} {...props}>
                    {children}
                  </code>
                );
              },
              a({ node, children, ...props }) {
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
