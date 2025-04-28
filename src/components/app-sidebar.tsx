
import { useEffect, useState } from "react";
import { Settings, Plus, MessageSquare, Menu, X, Zap, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useChat } from "@/contexts/chat-context";
import { cn } from "@/lib/utils";
import { GradientText } from "@/components/gradient-text";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function AppSidebar({ isOpen, onToggle }: SidebarProps) {
  const { 
    chats, 
    currentChat, 
    setCurrentChat, 
    createNewChat, 
    deleteChat, 
    setApiKey, 
    getApiKey 
  } = useChat();
  const isMobile = useIsMobile();
  const [apiKeyValue, setApiKeyValue] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("sparky_user") || "{}");
    setIsAdmin(userInfo.role === "admin");
    setApiKeyValue(getApiKey());
  }, [getApiKey]);

  const handleSaveApiKey = () => {
    setApiKey(apiKeyValue);
    setIsSettingsOpen(false);
  };

  const handleChatClick = (chatId: string) => {
    setCurrentChat(chatId);
    if (isMobile) {
      onToggle();
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem("sparky_user");
    navigate("/auth");
  };

  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-40",
          isOpen ? "block" : "hidden",
          !isMobile && "hidden"
        )}
        onClick={onToggle}
      />
      <aside 
        className={cn(
          "flex flex-col bg-sidebar fixed top-0 bottom-0 border-r border-border z-50",
          "rounded-r-2xl shadow-lg",
          "w-[280px] transition-transform duration-300 ease-in-out",
          isMobile && !isOpen && "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-accent animate-pulse-subtle" />
            <GradientText className="text-xl">Sparky AI</GradientText>
          </div>
          {isMobile && (
            <Button variant="ghost" size="icon" onClick={onToggle}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
        
        <div className="flex flex-col gap-2 p-2">
          <Button 
            onClick={() => {
              createNewChat();
              if (isMobile) onToggle();
            }}
            className="flex gap-2 items-center justify-start bg-gradient-to-r from-accent to-primary hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {chats.map((chat) => (
              <Button
                key={chat.id}
                variant={currentChat?.id === chat.id ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start text-left truncate",
                  "flex items-center gap-2 h-auto py-2 rounded-lg"
                )}
                onClick={() => handleChatClick(chat.id)}
                onDoubleClick={() => deleteChat(chat.id)}
              >
                <MessageSquare className="h-4 w-4 shrink-0" />
                <span className="truncate">{chat.title}</span>
              </Button>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-sidebar-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isAdmin && (
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Admin Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="api-key">OpenRouter API Key</Label>
                      <Input
                        id="api-key"
                        type="password"
                        placeholder="or_api_..."
                        value={apiKeyValue}
                        onChange={(e) => setApiKeyValue(e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground">
                        Get your API key from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="underline">openrouter.ai</a>
                      </p>
                    </div>
                    <Button onClick={handleSaveApiKey} className="w-full bg-gradient-to-r from-accent to-primary hover:opacity-90">
                      Save Settings
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
            
            <ThemeSwitcher />
          </div>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleLogout}
            className="rounded-lg"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </aside>
      
      {/* Mobile menu button */}
      {isMobile && (
        <Button
          variant="outline"
          size="icon"
          onClick={onToggle}
          className="fixed left-4 top-4 z-30 rounded-lg"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}
    </>
  );
}
