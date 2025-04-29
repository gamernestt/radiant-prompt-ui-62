
import { useModels } from "./settings/use-models";
import { useApiConfig } from "./settings/use-api-config";

export const useChatSettings = () => {
  const {
    activeModel,
    availableModels,
    setActiveModel,
    removeModel,
    addModel
  } = useModels();

  const {
    apiKeys,
    baseUrls,
    setApiKey,
    getApiKey,
    getAllApiKeys,
    setBaseUrl,
    getBaseUrl,
    getAllBaseUrls
  } = useApiConfig();

  return {
    // Model settings
    activeModel,
    availableModels,
    setActiveModel,
    removeModel,
    addModel,
    
    // API configuration
    setApiKey,
    getApiKey,
    getAllApiKeys,
    setBaseUrl,
    getBaseUrl,
    getAllBaseUrls
  };
};
