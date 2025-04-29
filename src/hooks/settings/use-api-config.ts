
import { useState, useEffect } from "react";
import { chatService } from "@/services/chat-service";
import { useToast } from "@/hooks/use-toast";

export function useApiConfig() {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [baseUrls, setBaseUrls] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    // Load API keys
    const keys = chatService.getAllApiKeys();
    setApiKeys(keys);

    // Load base URLs
    const urls = chatService.getAllBaseUrls();
    setBaseUrls(urls);
  }, []);

  const setApiKey = (key: string, provider: string = 'openai') => {
    chatService.setApiKey(key, provider);
    setApiKeys(chatService.getAllApiKeys());
    
    toast({
      title: `${provider.charAt(0).toUpperCase() + provider.slice(1)} API Key Updated`,
      description: `Your ${provider} API key has been saved.`,
    });
  };

  const setBaseUrl = (url: string, provider: string = 'openai') => {
    // Always set to OpenRouter URL
    chatService.setBaseUrl("https://openrouter.ai/api/v1", provider);
    setBaseUrls(chatService.getAllBaseUrls());
    
    toast({
      title: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Base URL Updated`,
      description: `Your ${provider} base URL has been saved to OpenRouter.`,
    });
  };

  const getApiKey = (provider: string = 'openai') => {
    return chatService.getApiKey(provider);
  };

  const getBaseUrl = (provider: string = 'openai') => {
    return chatService.getBaseUrl(provider);
  };

  const getAllApiKeys = () => {
    return apiKeys;
  };

  const getAllBaseUrls = () => {
    return baseUrls;
  };

  return {
    apiKeys,
    baseUrls,
    setApiKey,
    getApiKey,
    getAllApiKeys,
    setBaseUrl,
    getBaseUrl,
    getAllBaseUrls
  };
}
