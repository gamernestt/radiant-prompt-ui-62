
import { useRef, useState, useEffect } from "react";
import { useChat } from "@/contexts/chat-context";
import { ChatMessage, TypingAnimation } from "./chat-message";
import { ChatInput } from "./chat-input";
import { PromptSuggestions } from "./prompt-suggestions";
import { ModelSelector } from "./model-selector";
import { AppSidebar } from "./app-sidebar";
import { GradientText } from "./gradient-text";
import { LandingPage } from "./landing-page";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export function ChatLayout() {
  const { currentChat, getApiKey, isLoading } = useChat();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const apiKey = getApiKey();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  
  // Check if user is logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/auth");
      } else {
        setUser(data.session.user);
      }
    };
    
    checkSession();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          navigate("/auth");
        } else if (session) {
          setUser(session.user);
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex h-screen overflow-hidden relative">
      <AppSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      
      <main className={cn(
        "flex-1 flex flex-col",
        "transition-all duration-300 ease-in-out",
        "ml-0 md:ml-[280px]"
      )}>
        <header className="flex items-center justify-between p-4 border-b border-border">
          <GradientText className="text-2xl">Sparky AI</GradientText>
          <ModelSelector />
        </header>
        
        {!apiKey ? (
          <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="max-w-md text-center space-y-4">
              <GradientText className="text-2xl">Welcome to Sparky AI</GradientText>
              <p>To get started, please add your OpenRouter API key in the settings.</p>
              <p className="text-sm text-muted-foreground">
                You can find it in your OpenRouter dashboard at <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="underline">openrouter.ai</a>
              </p>
              <p className="text-sm text-muted-foreground">
                Click the settings icon in the sidebar to set up your API key.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-0">
              {currentChat?.messages && currentChat.messages.length > 0 ? (
                <>
                  {currentChat.messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  {isLoading && <TypingAnimation />}
                  <div ref={messagesEndRef} />
                </>
              ) : (
                <LandingPage />
              )}
            </div>
            <ChatInput />
          </>
        )}
      </main>
    </div>
  );
}
