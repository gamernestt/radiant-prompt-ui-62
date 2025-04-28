
import { useState, useEffect } from "react";
import { chatService } from "@/services/chat-service";
import { AIModels, defaultModels } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";

export const useChatSettings = () => {
  const [availableModels] = useState<AIModels[]>(defaultModels);
  const [activeModel, setActiveModelState] = useState<AIModels>(defaultModels[0]);
  const { toast } = useToast();

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
  }, []);

  useEffect(() => {
    localStorage.setItem("activeModel", JSON.stringify(activeModel));
  }, [activeModel]);

  const setApiKey = (key: string) => {
    chatService.setApiKey(key);
    localStorage.setItem("openrouter_api_key", key);
    toast({
      title: "API Key Updated",
      description: "Your OpenRouter API key has been saved.",
    });
  };

  const getApiKey = () => {
    return chatService.getApiKey();
  };

  const setActiveModel = (model: AIModels) => {
    setActiveModelState(model);
  };

  return {
    activeModel,
    availableModels,
    setActiveModel,
    setApiKey,
    getApiKey
  };
};
