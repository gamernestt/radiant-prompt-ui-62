
import { useState, useEffect } from "react";
import { useChat } from "@/contexts/chat-context";
import { TabsContent } from "@/components/ui/tabs";
import { ProviderApiSection } from "../provider-api-section";

interface ApiKeysTabProps {
  active: boolean;
}

export function ApiKeysTab({ active }: ApiKeysTabProps) {
  const { getAllApiKeys, setApiKey } = useChat();
  const [apiKeyValues, setApiKeyValues] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Load existing API keys
    const initialApiKeys = getAllApiKeys ? getAllApiKeys() : {};
    setApiKeyValues(initialApiKeys);
  }, [getAllApiKeys]);

  const handleApiKeyChange = (provider: string, value: string) => {
    setApiKeyValues(prev => ({...prev, [provider]: value}));
  };

  const handleSaveApiKey = (provider: string, value: string) => {
    setApiKey(value, provider);
  };

  return (
    <TabsContent value="apikeys" className="space-y-4">
      <ProviderApiSection 
        key="openai"
        provider="openai"
        value={apiKeyValues["openai"] || ''}
        onChange={(value) => handleApiKeyChange("openai", value)}
        onSave={(value) => handleSaveApiKey("openai", value)}
        type="apikey"
        active={active}
      />
      <ProviderApiSection 
        key="deepseek"
        provider="deepseek"
        value={apiKeyValues["deepseek"] || ''}
        onChange={(value) => handleApiKeyChange("deepseek", value)}
        onSave={(value) => handleSaveApiKey("deepseek", value)}
        type="apikey"
        active={active}
      />
    </TabsContent>
  );
}

export function getProviderDisplayName(provider: string): string {
  switch (provider.toLowerCase()) {
    case 'openai':
      return 'OpenAI';
    case 'deepseek':
      return 'Deepseek';
    default:
      return provider.charAt(0).toUpperCase() + provider.slice(1);
  }
}
