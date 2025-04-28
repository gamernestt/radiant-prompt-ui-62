
import { useState, useEffect } from "react";
import { chatService } from "@/services/chat-service";
import { AIModels, defaultModels } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";

export const useChatSettings = () => {
  const [availableModels] = useState<AIModels[]>(defaultModels);
  const [activeModel, setActiveModelState] = useState<AIModels>(defaultModels[0]);
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [baseUrls, setBaseUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const savedModel = localStorage.getItem("activeModel");
    if (savedModel) {
      try {
        const model = JSON.parse(savedModel);
        setActiveModelState(model);
      } catch (error) {
        console.error("Failed to parse saved model:", error);
      }
    }
    
    // Load API keys
    const keys = chatService.getAllApiKeys();
    setApiKeys(keys);

    // Load base URLs
    const urls = chatService.getAllBaseUrls();
    setBaseUrls(urls);
  }, []);

  useEffect(() => {
    localStorage.setItem("activeModel", JSON.stringify(activeModel));
  }, [activeModel]);

  const setApiKey = (key: string, provider: string = 'openrouter') => {
    chatService.setApiKey(key, provider);
    setApiKeys(chatService.getAllApiKeys());
    
    toast({
      title: `${provider.charAt(0).toUpperCase() + provider.slice(1)} API Key Updated`,
      description: `Your ${provider} API key has been saved.`,
    });
  };

  const setBaseUrl = (url: string, provider: string = 'openrouter') => {
    chatService.setBaseUrl(url, provider);
    setBaseUrls(chatService.getAllBaseUrls());
    
    toast({
      title: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Base URL Updated`,
      description: `Your ${provider} base URL has been saved.`,
    });
  };

  const getApiKey = (provider: string = 'openrouter') => {
    return chatService.getApiKey(provider);
  };

  const getBaseUrl = (provider: string = 'openrouter') => {
    return chatService.getBaseUrl(provider);
  };

  const getAllApiKeys = () => {
    return apiKeys;
  };

  const getAllBaseUrls = () => {
    return baseUrls;
  };

  const setActiveModel = (model: AIModels) => {
    setActiveModelState(model);
  };

  return {
    activeModel,
    availableModels,
    setActiveModel,
    setApiKey,
    getApiKey,
    getAllApiKeys,
    setBaseUrl,
    getBaseUrl,
    getAllBaseUrls
  };
};
