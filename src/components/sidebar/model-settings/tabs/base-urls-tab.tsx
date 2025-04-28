
import { useState, useEffect } from "react";
import { useChat } from "@/contexts/chat-context";
import { TabsContent } from "@/components/ui/tabs";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProviderApiSection } from "../provider-api-section";
import { getProviderDisplayName } from "./api-keys-tab";

interface BaseUrlsTabProps {
  active: boolean;
}

export function BaseUrlsTab({ active }: BaseUrlsTabProps) {
  const { getAllBaseUrls, availableModels } = useChat();
  const [baseUrlValues, setBaseUrlValues] = useState<Record<string, string>>({});
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
  
  // Get unique provider names for tabs
  const providerNames = Object.keys(modelsByProvider);

  useEffect(() => {
    // Load existing base URLs
    const initialBaseUrls = getAllBaseUrls ? getAllBaseUrls() : {};
    setBaseUrlValues(initialBaseUrls);
  }, [getAllBaseUrls]);

  const handleBaseUrlChange = (provider: string, value: string) => {
    setBaseUrlValues(prev => ({...prev, [provider]: value}));
  };

  return (
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
          <ProviderApiSection 
            key={provider}
            provider={provider}
            value={baseUrlValues[provider] || ''}
            onChange={(value) => handleBaseUrlChange(provider, value)}
            type="baseurl"
            active={activeTab === provider}
          />
        ))}
      </Tabs>
    </TabsContent>
  );
}
