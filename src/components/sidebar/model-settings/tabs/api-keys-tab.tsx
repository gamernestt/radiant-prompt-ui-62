
import { useState, useEffect } from "react";
import { KeyRound } from "lucide-react";
import { useChat } from "@/contexts/chat-context";
import { TabsContent } from "@/components/ui/tabs";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ProviderApiSection } from "../provider-api-section";

interface ApiKeysTabProps {
  active: boolean;
}

export function ApiKeysTab({ active }: ApiKeysTabProps) {
  const { getAllApiKeys, availableModels } = useChat();
  const [apiKeyValues, setApiKeyValues] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("openrouter");
  
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
  }, [getAllApiKeys]);

  const handleApiKeyChange = (provider: string, value: string) => {
    setApiKeyValues(prev => ({...prev, [provider]: value}));
  };

  return (
    <TabsContent value="apikeys" className="space-y-4">
      <Tabs defaultValue="openrouter" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full flex flex-wrap">
          {providerNames.map((provider) => (
            <TabsTrigger key={provider} value={provider} className="flex-1 min-w-24">
              {getProviderDisplayName(provider)}
            </TabsTrigger>
          ))}
        </TabsList>

        {providerNames.map((provider) => (
          <ProviderApiSection 
            key={provider}
            provider={provider}
            value={apiKeyValues[provider] || ''}
            onChange={(value) => handleApiKeyChange(provider, value)}
            type="apikey"
            active={activeTab === provider}
          />
        ))}
      </Tabs>
    </TabsContent>
  );
}

export function getProviderDisplayName(provider: string): string {
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
}
