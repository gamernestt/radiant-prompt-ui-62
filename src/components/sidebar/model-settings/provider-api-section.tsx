
import { TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { KeyRound, Globe } from "lucide-react";
import { useChat } from "@/contexts/chat-context";
import { getProviderDisplayName } from "./tabs/api-keys-tab";

interface ProviderApiSectionProps {
  provider: string;
  value: string;
  onChange: (value: string) => void;
  type: "apikey" | "baseurl";
  active: boolean;
}

export function ProviderApiSection({ provider, value, onChange, type, active }: ProviderApiSectionProps) {
  const { setApiKey, setBaseUrl } = useChat();
  
  const handleSave = () => {
    if (type === "apikey") {
      setApiKey(value || '', provider);
    } else {
      setBaseUrl(value || '', provider);
    }
  };
  
  const isApiKey = type === "apikey";
  const icon = isApiKey ? <KeyRound className="h-4 w-4" /> : <Globe className="h-4 w-4" />;
  const labelText = isApiKey ? 
    `${getProviderDisplayName(provider)} API Key` : 
    `${getProviderDisplayName(provider)} Base URL`;
  
  const getProviderDocsLink = () => {
    if (isApiKey) {
      switch(provider) {
        case 'openai': return <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">OpenAI</a>;
        case 'anthropic': return <a href="https://console.anthropic.com/keys" target="_blank" rel="noopener noreferrer" className="underline">Anthropic</a>;
        case 'google': return <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">Google AI Studio</a>;
        case 'meta': return <a href="https://llama.meta.com/get-started" target="_blank" rel="noopener noreferrer" className="underline">Meta Llama</a>;
        case 'deepseek': return <a href="https://platform.deepseek.com/" target="_blank" rel="noopener noreferrer" className="underline">Deepseek</a>;
        case 'openrouter': return <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="underline">OpenRouter</a>;
        default: return null;
      }
    } else {
      switch(provider) {
        case 'openrouter': return <>Default: https://openrouter.ai/api/v1</>;
        case 'openai': return <>Default: https://api.openai.com/v1</>;
        case 'anthropic': return <>Default: https://api.anthropic.com/v1</>;
        default: return null;
      }
    }
  };
  
  const getPlaceholder = () => {
    if (isApiKey) {
      return `Enter ${getProviderDisplayName(provider)} API key...`;
    } else {
      if (provider === 'openrouter') return 'https://openrouter.ai/api/v1';
      return `Enter ${getProviderDisplayName(provider)} base URL...`;
    }
  };
  
  return (
    <TabsContent value={provider} className="space-y-4 mt-2">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {icon}
          <Label htmlFor={`${provider}-${type}`}>{labelText}</Label>
        </div>
        <Input
          id={`${provider}-${type}`}
          type={isApiKey ? "password" : "text"}
          placeholder={getPlaceholder()}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
        />
        {getProviderDocsLink() && (
          <p className="text-sm text-muted-foreground">
            {isApiKey ? <>Get your API key from {getProviderDocsLink()}</> : getProviderDocsLink()}
          </p>
        )}
        <Button 
          onClick={handleSave} 
          className="w-full bg-gradient-to-r from-accent to-primary hover:opacity-90"
          disabled={isApiKey && !value?.trim()}
        >
          Save {getProviderDisplayName(provider)} {isApiKey ? "API Key" : "Base URL"}
        </Button>
      </div>
    </TabsContent>
  );
}
