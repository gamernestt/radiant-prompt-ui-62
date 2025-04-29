
import { useState, useEffect } from "react";
import { useChat } from "@/contexts/chat-context";
import { TabsContent } from "@/components/ui/tabs";
import { ProviderApiSection } from "../provider-api-section";
import { getProviderDisplayName } from "./api-keys-tab";
import { Alert } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface BaseUrlsTabProps {
  active: boolean;
}

export function BaseUrlsTab({ active }: BaseUrlsTabProps) {
  const { getAllBaseUrls } = useChat();
  const [baseUrlValues, setBaseUrlValues] = useState<Record<string, string>>({});
  
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
      <Alert className="bg-primary/10 border-primary mb-4">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5" />
          <div>
            <p className="font-medium">OpenAI Base URL</p>
            <p className="text-sm">The OpenAI Base URL is fixed to "https://openrouter.ai/api/v1"</p>
          </div>
        </div>
      </Alert>
      
      <ProviderApiSection 
        provider="openai"
        value="https://openrouter.ai/api/v1"
        onChange={(value) => handleBaseUrlChange("openai", value)}
        type="baseurl"
        active={true}
        readonly={true}
      />
    </TabsContent>
  );
}
