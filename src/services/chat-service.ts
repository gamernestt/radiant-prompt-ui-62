
import { Message } from '@/types/chat';
import { OpenRouterClient } from './api/openrouter-client';
import { ApiConfigService } from './config/api-config';
import { ChatUtilsService } from './utils/chat-utils';

export class ChatService {
  private apiConfig: ApiConfigService;
  private utils: ChatUtilsService;
  
  constructor(apiKey: string = '') {
    // Initialize services
    this.apiConfig = new ApiConfigService(apiKey);
    this.utils = new ChatUtilsService();
  }
  
  // API Key management
  setApiKey(key: string, provider: string = 'openai') {
    this.apiConfig.setApiKey(key, provider);
  }

  getApiKey(provider: string = 'openai'): string {
    return this.apiConfig.getApiKey(provider);
  }
  
  getAllApiKeys(): Record<string, string> {
    return this.apiConfig.getAllApiKeys();
  }
  
  // Base URL management
  setBaseUrl(url: string, provider: string = 'openai') {
    this.apiConfig.setBaseUrl(url, provider);
  }

  getBaseUrl(provider: string = 'openai'): string {
    return this.apiConfig.getBaseUrl(provider);
  }
  
  getAllBaseUrls(): Record<string, string> {
    return this.apiConfig.getAllBaseUrls();
  }

  // Message sending
  async sendMessage(
    messages: Message[], 
    model: string = 'openai/gpt-4o',
    temperature: number = 0.7,
    maxTokens: number = 1000
  ): Promise<string> {
    // Get the provider from the model string (e.g., 'openai/gpt-4o' -> 'openai')
    const provider = model.split('/')[0].toLowerCase();
    
    // Get the API key for the specific provider 
    let apiKey = this.getApiKey(provider);
    
    // If no provider-specific key exists, fall back to OpenRouter key
    if (!apiKey) {
      apiKey = this.getApiKey('openrouter');
    }
    
    if (!apiKey) {
      throw new Error(`API key not set for ${provider}. Please set your API key in the settings.`);
    }
    
    console.log(`Sending message using model: ${model}`);
    
    // Create an instance of OpenRouterClient with the API key
    const client = new OpenRouterClient(apiKey);
    
    // Send the message using the client
    return await client.sendChatRequest(messages, model, temperature, maxTokens);
  }

  // Utility methods for chat and message management
  createEmptyChat() {
    return this.utils.createEmptyChat();
  }

  createMessage(role: Message['role'], content: string, images?: string[]) {
    return this.utils.createMessage(role, content, images);
  }

  generateTitle(messages: Message[]): string {
    return this.utils.generateTitle(messages);
  }
}

// Initialize with legacy key from localStorage if available
export const chatService = new ChatService(
  localStorage.getItem('openrouter_api_key') || ''
);
