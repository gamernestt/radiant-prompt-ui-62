import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Message } from "@/types/chat";
import ReactMarkdown from "react-markdown";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ThumbsDown, ThumbsUp, Zap, Copy, Volume2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [feedback, setFeedback] = useState<'like' | 'dislike' | null>(null);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The code has been copied to your clipboard.",
    });
  };
  
  const handleFeedback = (type: 'like' | 'dislike') => {
    setFeedback(type);
    toast({
      title: type === 'like' ? "Thank you for your feedback!" : "We'll improve our responses",
      description: type === 'like' ? "We're glad this was helpful" : "Your feedback helps us do better"
    });
  };
  
  const speakMessage = async () => {
    if ('speechSynthesis' in window) {
      setAudioPlaying(true);
      
      // Create a new speech synthesis utterance
      const utterance = new SpeechSynthesisUtterance(message.content);
      
      // Set properties
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // Add an event listener for when speech has finished
      utterance.onend = () => {
        setAudioPlaying(false);
      };
      
      // Speak the text
      window.speechSynthesis.speak(utterance);
      
      toast({
        title: "Speaking message",
        description: "The AI is now reading the message aloud."
      });
    } else {
      toast({
        title: "Speech synthesis not supported",
        description: "Your browser doesn't support speech synthesis.",
        variant: "destructive"
      });
    }
  };
  
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
              code({ className, children, node, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                
                return match ? (
                  <div className="relative overflow-hidden rounded-md">
                    <div className="absolute right-2 top-2 z-10">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-7 w-7 bg-secondary/60 rounded-sm hover:bg-secondary"
                        onClick={() => copyToClipboard(String(children))}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
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
        
        {!isUser && (
          <div className="flex items-center gap-2 ml-2">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 rounded-full",
                feedback === 'like' ? "bg-green-500/20 text-green-500" : ""
              )}
              onClick={() => handleFeedback('like')}
              title="Like this response"
            >
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 rounded-full",
                feedback === 'dislike' ? "bg-red-500/20 text-red-500" : ""
              )}
              onClick={() => handleFeedback('dislike')}
              title="Dislike this response"
            >
              <ThumbsDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 rounded-full",
                audioPlaying ? "bg-primary/20 text-primary animate-pulse" : ""
              )}
              onClick={speakMessage}
              disabled={audioPlaying}
              title="Listen to this response"
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
        )}
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
