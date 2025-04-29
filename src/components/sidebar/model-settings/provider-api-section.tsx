
import { TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { KeyRound, Globe, Lock } from "lucide-react";
import { useChat } from "@/contexts/chat-context";
import { getProviderDisplayName } from "./tabs/api-keys-tab";

interface ProviderApiSectionProps {
  provider: string;
  value: string;
  onChange: (value: string) => void;
  onSave?: (value: string) => void;
  type: "apikey" | "baseurl";
  active: boolean;
  readonly?: boolean;
}

export function ProviderApiSection({ 
  provider, 
  value, 
  onChange,
  onSave, 
  type, 
  active,
  readonly = false 
}: ProviderApiSectionProps) {
  const handleSave = () => {
    if (readonly) return;
    
    if (onSave) {
      onSave(value);
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
        case 'deepseek': return <a href="https://platform.deepseek.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline">Deepseek</a>;
        default: return null;
      }
    } else {
      return <>Base URL: https://openrouter.ai/api/v1</>;
    }
  };
  
  const getPlaceholder = () => {
    if (isApiKey) {
      return `Enter ${getProviderDisplayName(provider)} API key...`;
    } else {
      return `https://openrouter.ai/api/v1`;
    }
  };
  
  if (!active) return null;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {icon}
        <Label htmlFor={`${provider}-${type}`}>{labelText}</Label>
        {readonly && <Lock className="h-3 w-3 text-muted-foreground" />}
      </div>
      <Input
        id={`${provider}-${type}`}
        type={isApiKey ? "password" : "text"}
        placeholder={getPlaceholder()}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readonly}
        className={readonly ? "bg-muted cursor-not-allowed" : ""}
      />
      {getProviderDocsLink() && (
        <p className="text-sm text-muted-foreground">
          {isApiKey ? <>Get your API key from {getProviderDocsLink()}</> : getProviderDocsLink()}
        </p>
      )}
      {!readonly && (
        <Button 
          onClick={handleSave} 
          className="w-full bg-gradient-to-r from-accent to-primary hover:opacity-90"
          disabled={isApiKey && !value?.trim()}
        >
          Save {getProviderDisplayName(provider)} {isApiKey ? "API Key" : "Base URL"}
        </Button>
      )}
    </div>
  );
}
