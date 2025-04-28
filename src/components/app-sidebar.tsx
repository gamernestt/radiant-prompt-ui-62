
import { useEffect, useState } from "react";
import { Settings, Plus, MessageSquare, Menu, X, Zap, LogOut, Trash2, KeyRound } from "lucide-react";
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
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCheck } from "@/hooks/use-admin-check";

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
    getApiKey,
    getAllApiKeys,
    availableModels
  } = useChat();
  const isMobile = useIsMobile();
  const [apiKeyValues, setApiKeyValues] = useState<Record<string, string>>({});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("openrouter");
  
  // Use the admin check hook to determine if user is admin
  const { isAdmin, isLoading: isAdminLoading } = useAdminCheck(user?.id);
  
  // Group models by provider
  const modelsByProvider = availableModels.reduce((acc, model) => {
    const provider = model.provider.toLowerCase();
    if (!acc[provider]) {
      acc[provider] = [];
    }
    acc[provider].push(model);
    return acc;
  }, {} as Record<string, typeof availableModels>);
  
  // Get unique provider names for the API keys tabs
  const providerNames = Object.keys(modelsByProvider);
  
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUser(data.session.user);
      } else {
        navigate("/auth");
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
    
    // Load existing API keys
    const initialApiKeys = getAllApiKeys ? getAllApiKeys() : { openrouter: getApiKey() };
    setApiKeyValues(initialApiKeys);
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [getApiKey, getAllApiKeys, navigate]);

  const handleSaveApiKey = (provider: string) => {
    setApiKey(apiKeyValues[provider] || '', provider);
  };

  const handleChatClick = (chatId: string) => {
    setCurrentChat(chatId);
    if (isMobile) {
      onToggle();
    }
  };
  
  const handleDeleteChat = (chatId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setChatToDelete(chatId);
    setDeleteDialogOpen(true);
  };
  
  const confirmDeleteChat = () => {
    if (chatToDelete) {
      deleteChat(chatToDelete);
      setDeleteDialogOpen(false);
      setChatToDelete(null);
    }
  };
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("sparky_user");
    navigate("/auth");
  };

  // Helper function to get provider display name with proper capitalization
  const getProviderDisplayName = (provider: string): string => {
    switch (provider.toLowerCase()) {
      case 'openai':
        return 'OpenAI';
      case 'anthropic':
        return 'Anthropic/Claude';
      case 'google':
        return 'Google/Gemini';
      case 'meta':
        return 'Meta/Llama';
      case 'deepseek':
        return 'Deepseek';
      default:
        return provider.charAt(0).toUpperCase() + provider.slice(1);
    }
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
              <div key={chat.id} className="flex items-center group">
                <Button
                  variant={currentChat?.id === chat.id ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start text-left truncate",
                    "flex items-center gap-2 h-auto py-2 rounded-lg"
                  )}
                  onClick={() => handleChatClick(chat.id)}
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className="truncate">{chat.title}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleDeleteChat(chat.id, e)}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-sidebar-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Only show settings button if user is admin */}
            {isAdmin && (
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>AI Models Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <Tabs defaultValue="apikeys" value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="grid grid-cols-2 mb-4">
                        <TabsTrigger value="apikeys">API Keys</TabsTrigger>
                        <TabsTrigger value="models">Available Models</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="apikeys" className="space-y-4">
                        <Tabs defaultValue="openrouter" className="w-full">
                          <TabsList className="w-full flex flex-wrap">
                            {providerNames.map((provider) => (
                              <TabsTrigger key={provider} value={provider} className="flex-1 min-w-24">
                                {getProviderDisplayName(provider)}
                              </TabsTrigger>
                            ))}
                          </TabsList>

                          {providerNames.map((provider) => (
                            <TabsContent key={provider} value={provider} className="space-y-4 mt-2">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <KeyRound className="h-4 w-4" />
                                  <Label htmlFor={`${provider}-api-key`}>{getProviderDisplayName(provider)} API Key</Label>
                                </div>
                                <Input
                                  id={`${provider}-api-key`}
                                  type="password"
                                  placeholder={`Enter ${getProviderDisplayName(provider)} API key...`}
                                  value={apiKeyValues[provider] || ''}
                                  onChange={(e) => setApiKeyValues({...apiKeyValues, [provider]: e.target.value})}
                                />
                                <p className="text-sm text-muted-foreground">
                                  {provider === 'openai' && (
                                    <>Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">OpenAI</a></>
                                  )}
                                  {provider === 'anthropic' && (
                                    <>Get your API key from <a href="https://console.anthropic.com/keys" target="_blank" rel="noopener noreferrer" className="underline">Anthropic</a></>
                                  )}
                                  {provider === 'google' && (
                                    <>Get your API key from <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a></>
                                  )}
                                  {provider === 'meta' && (
                                    <>Configure via <a href="https://llama.meta.com/get-started" target="_blank" rel="noopener noreferrer" className="underline">Meta Llama</a></>
                                  )}
                                  {provider === 'deepseek' && (
                                    <>Get your API key from <a href="https://platform.deepseek.com/" target="_blank" rel="noopener noreferrer" className="underline">Deepseek</a></>
                                  )}
                                  {provider === 'openrouter' && (
                                    <>Get your API key from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="underline">OpenRouter</a></>
                                  )}
                                </p>
                                <Button 
                                  onClick={() => handleSaveApiKey(provider)} 
                                  className="w-full bg-gradient-to-r from-accent to-primary hover:opacity-90"
                                  disabled={!apiKeyValues[provider]?.trim()}
                                >
                                  Save {getProviderDisplayName(provider)} API Key
                                </Button>
                              </div>
                            </TabsContent>
                          ))}
                        </Tabs>
                      </TabsContent>
                      
                      <TabsContent value="models">
                        <div className="space-y-4">
                          {providerNames.map((provider) => (
                            <div key={provider} className="space-y-2">
                              <h3 className="text-lg font-medium capitalize">{getProviderDisplayName(provider)}</h3>
                              <ul className="space-y-2">
                                {modelsByProvider[provider].map((model) => (
                                  <li key={model.id} className="p-2 bg-secondary/30 rounded-md">
                                    <div className="font-medium">{model.name}</div>
                                    <div className="text-xs text-muted-foreground">{model.id}</div>
                                    {model.description && (
                                      <div className="text-sm mt-1">{model.description}</div>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
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
      
      {/* Delete Chat Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chat? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteChat} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
