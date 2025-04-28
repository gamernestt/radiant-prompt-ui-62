
import { useState, useEffect } from "react";
import { KeyRound, Globe, Trash2 } from "lucide-react";
import { useChat } from "@/contexts/chat-context";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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

interface ModelSettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ModelSettingsDialog({ isOpen, onOpenChange }: ModelSettingsDialogProps) {
  const { 
    getAllApiKeys, 
    setApiKey, 
    availableModels,
    getAllBaseUrls,
    setBaseUrl,
    removeModel
  } = useChat();
  
  const [apiKeyValues, setApiKeyValues] = useState<Record<string, string>>({});
  const [baseUrlValues, setBaseUrlValues] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("openrouter");
  const [configTab, setConfigTab] = useState("apikeys");
  const [isAdmin, setIsAdmin] = useState(false);
  const [modelToRemove, setModelToRemove] = useState<string | null>(null);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  
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
    // Load existing API keys
    const initialApiKeys = getAllApiKeys ? getAllApiKeys() : {};
    setApiKeyValues(initialApiKeys);
    
    // Load existing base URLs
    const initialBaseUrls = getAllBaseUrls ? getAllBaseUrls() : {};
    setBaseUrlValues(initialBaseUrls);
    
    // Check if user is admin
    const checkAdmin = async () => {
      try {
        const response = await fetch('/api/check-admin', {
          credentials: 'include'
        });
        if (response.ok) {
          setIsAdmin(true);
        }
      } catch (error) {
        // Fallback for demo purposes - in a real app this would be properly secured
        // We're using the admin check hook in the sidebar, so we'll set this to true
        setIsAdmin(true);
      }
    };
    
    checkAdmin();
  }, [getAllApiKeys, getAllBaseUrls]);

  const handleSaveApiKey = (provider: string) => {
    setApiKey(apiKeyValues[provider] || '', provider);
  };
  
  const handleSaveBaseUrl = (provider: string) => {
    setBaseUrl(baseUrlValues[provider] || '', provider);
  };
  
  const handleRemoveModel = (modelId: string) => {
    if (!isAdmin) return;
    
    setModelToRemove(modelId);
    setIsRemoveDialogOpen(true);
  };
  
  const confirmRemoveModel = () => {
    if (modelToRemove) {
      removeModel(modelToRemove);
      setModelToRemove(null);
      setIsRemoveDialogOpen(false);
    }
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
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI Models Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Tabs defaultValue="apikeys" value={configTab} onValueChange={setConfigTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="apikeys">API Keys</TabsTrigger>
                <TabsTrigger value="baseurls">Base URLs</TabsTrigger>
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
              
              <TabsContent value="baseurls" className="space-y-4">
                <Tabs defaultValue="openrouter" value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                          <Globe className="h-4 w-4" />
                          <Label htmlFor={`${provider}-base-url`}>{getProviderDisplayName(provider)} Base URL</Label>
                        </div>
                        <Input
                          id={`${provider}-base-url`}
                          type="text"
                          placeholder={provider === 'openrouter' ? 'https://openrouter.ai/api/v1' : `Enter ${getProviderDisplayName(provider)} base URL...`}
                          value={baseUrlValues[provider] || ''}
                          onChange={(e) => setBaseUrlValues({...baseUrlValues, [provider]: e.target.value})}
                        />
                        <p className="text-sm text-muted-foreground">
                          {provider === 'openrouter' && (
                            <>Default: https://openrouter.ai/api/v1</>
                          )}
                          {provider === 'openai' && (
                            <>Default: https://api.openai.com/v1</>
                          )}
                          {provider === 'anthropic' && (
                            <>Default: https://api.anthropic.com/v1</>
                          )}
                        </p>
                        <Button 
                          onClick={() => handleSaveBaseUrl(provider)} 
                          className="w-full bg-gradient-to-r from-accent to-primary hover:opacity-90"
                        >
                          Save {getProviderDisplayName(provider)} Base URL
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
                          <li key={model.id} className="p-2 bg-secondary/30 rounded-md flex justify-between items-start">
                            <div className="flex-1">
                              <div className="font-medium">{model.name}</div>
                              <div className="text-xs text-muted-foreground">{model.id}</div>
                              {model.description && (
                                <div className="text-sm mt-1">{model.description}</div>
                              )}
                            </div>
                            {isAdmin && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleRemoveModel(model.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  {!isAdmin && (
                    <div className="text-center p-4 text-sm text-muted-foreground">
                      Only administrators can remove models
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog for removing a model */}
      <AlertDialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Model</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this model from the available models list?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setModelToRemove(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmRemoveModel}
              className="bg-destructive hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
