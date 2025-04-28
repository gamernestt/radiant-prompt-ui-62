
import { useState, useEffect } from "react";
import { chatService } from "@/services/chat-service";
import { AIModels, defaultModels } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";

export const useChatSettings = () => {
  const [availableModels, setAvailableModels] = useState<AIModels[]>(defaultModels);
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

    // Load custom models list
    const savedModels = localStorage.getItem("availableModels");
    if (savedModels) {
      try {
        const models = JSON.parse(savedModels);
        setAvailableModels(models);
      } catch (error) {
        console.error("Failed to parse saved models:", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("activeModel", JSON.stringify(activeModel));
  }, [activeModel]);

  useEffect(() => {
    localStorage.setItem("availableModels", JSON.stringify(availableModels));
  }, [availableModels]);

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

  const removeModel = (modelId: string) => {
    // Check if model is currently active
    if (activeModel.id === modelId) {
      // Set to first available model that's not being removed
      const firstAvailableModel = availableModels.find(m => m.id !== modelId) || defaultModels[0];
      setActiveModelState(firstAvailableModel);
      toast({
        title: "Active Model Changed",
        description: `Active model was removed. Now using ${firstAvailableModel.name}.`,
      });
    }

    // Remove the model from available models
    const updatedModels = availableModels.filter(model => model.id !== modelId);
    setAvailableModels(updatedModels);
    
    toast({
      title: "Model Removed",
      description: "The selected model has been removed from the available models list.",
    });
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
    getAllBaseUrls,
    removeModel
  };
};
