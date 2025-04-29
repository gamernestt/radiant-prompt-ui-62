
import { Button } from "@/components/ui/button";
import { GradientText } from "@/components/gradient-text";
import { useChat } from "@/contexts/chat-context";
import { Zap, MessageSquare, Sparkles, Search, Brain, Music, Code, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export function LandingPage() {
  const { createNewChat, sendMessage } = useChat();
  const navigate = useNavigate();
  const [isNavigating, setIsNavigating] = useState(false);
  
  const featuredPrompts = [
    {
      icon: Brain,
      title: "Creative Writing",
      prompt: "Help me write a short story about a robot who discovers emotions.",
    },
    {
      icon: Code,
      title: "Coding Help",
      prompt: "Explain how promises work in JavaScript with examples.",
    },
    {
      icon: BookOpen,
      title: "Learning",
      prompt: "Explain quantum computing in simple terms.",
    },
    {
      icon: Music,
      title: "Music Discovery",
      prompt: "Recommend some music similar to Pink Floyd but from the last decade.",
    },
  ];
  
  const handleStartChat = async (prompt?: string) => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    try {
      const newChat = createNewChat();
      
      // Ensure we navigate to the chat page first
      navigate("/");
      
      // Wait a bit to ensure chat context is updated
      if (prompt) {
        // Use setTimeout to ensure the chat context is fully updated
        setTimeout(() => {
          sendMessage(prompt);
        }, 200);
      }
    } catch (error) {
      console.error("Error starting chat:", error);
    } finally {
      setIsNavigating(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 overflow-y-auto">
      <div className="w-full max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Zap className="h-10 w-10 text-white" />
            </div>
          </div>
          <GradientText className="text-4xl font-bold mb-2">Welcome to Sparky AI</GradientText>
          <p className="text-muted-foreground text-lg">Your intelligent assistant powered by state-of-the-art AI</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Button 
            onClick={() => handleStartChat()}
            className="h-20 bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 relative z-10"
            disabled={isNavigating}
          >
            <div className="flex items-center justify-center gap-3">
              <MessageSquare className="h-6 w-6" />
              <span className="text-lg font-medium">Start New Chat</span>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-20 border-2 border-purple-500/20 hover:border-purple-500/40 transition-all relative z-10"
            onClick={() => handleStartChat("What can you help me with today?")}
            disabled={isNavigating}
          >
            <div className="flex items-center justify-center gap-3">
              <Sparkles className="h-6 w-6 text-purple-500" />
              <span className="text-lg font-medium">Explore Capabilities</span>
            </div>
          </Button>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Featured Prompts
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {featuredPrompts.map((item, index) => (
              <button 
                key={index}
                onClick={() => handleStartChat(item.prompt)}
                className={cn(
                  "p-4 rounded-lg border w-full text-left relative z-10",
                  "hover:bg-accent/50 hover:border-accent transition-colors",
                  "animate-fade-in cursor-pointer"
                )}
                style={{ animationDelay: `${index * 0.1}s` }}
                disabled={isNavigating}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{item.prompt}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
