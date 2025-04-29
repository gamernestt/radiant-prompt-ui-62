import { useState, useEffect } from "react";
import { chatService } from "@/services/chat-service";
import { AIModels, defaultModels } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";

// Filter only OpenAI models
const openaiModels: AIModels[] = [
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    description: "Most capable model for complex tasks"
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    provider: "OpenAI",
    description: "Smaller and faster version of GPT-4o"
  },
  {
    id: "openai/gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    provider: "OpenAI",
    description: "Fast and cost-effective model"
  }
];

export const useChatSettings = () => {
  const [availableModels, setAvailableModels] = useState<AIModels[]>(openaiModels);
  const [activeModel, setActiveModelState] = useState<AIModels>(openaiModels[0]);
  const { toast } = useToast();
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [baseUrls, setBaseUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    const savedModel = localStorage.getItem("activeModel");
    if (savedModel) {
      try {
        const model = JSON.parse(savedModel);
        // Check if the saved model is still in our filtered list
        const isOpenAIModel = openaiModels.some(m => m.id === model.id);
        
        if (isOpenAIModel) {
          setActiveModelState(model);
        } else {
          // If the saved model isn't in our filtered list, use the first OpenAI model
          setActiveModelState(openaiModels[0]);
          localStorage.setItem("activeModel", JSON.stringify(openaiModels[0]));
        }
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

    // Load custom models list, but filter for only OpenAI models
    const savedModels = localStorage.getItem("availableModels");
    if (savedModels) {
      try {
        const models = JSON.parse(savedModels);
        const filteredModels = models.filter((model: AIModels) => 
          model.provider.toLowerCase() === 'openai'
        );
        
        // If we have filtered models, use them, otherwise use default OpenAI models
        if (filteredModels.length > 0) {
          setAvailableModels(filteredModels);
        } else {
          setAvailableModels(openaiModels);
          localStorage.setItem("availableModels", JSON.stringify(openaiModels));
        }
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

  const addModel = (model: AIModels) => {
    // Check if model with same ID already exists
    if (availableModels.some(m => m.id === model.id)) {
      toast({
        title: "Model already exists",
        description: "A model with this ID already exists in your list.",
        variant: "destructive",
      });
      return;
    }

    // Only allow adding OpenAI models
    if (model.provider.toLowerCase() !== 'openai') {
      toast({
        title: "Invalid model provider",
        description: "Only OpenAI models are allowed.",
        variant: "destructive",
      });
      return;
    }

    // Add the new model to available models
    const updatedModels = [...availableModels, model];
    setAvailableModels(updatedModels);
    
    toast({
      title: "Model Added",
      description: `${model.name} has been added to your available models.`,
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
    removeModel,
    addModel
  };
};
