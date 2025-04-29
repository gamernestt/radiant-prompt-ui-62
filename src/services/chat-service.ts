
import { v4 as uuidv4 } from 'uuid';
import { 
  Message, 
  Chat, 
  OpenRouterRequest, 
  OpenRouterResponse, 
  OpenRouterMessage,
  APIKeyConfig 
} from '@/types/chat';

export class ChatService {
  private apiKeys: Record<string, string>;
  private baseUrls: Record<string, string>;
  private defaultBaseUrl: string = 'https://openrouter.ai/api/v1';
  
  constructor(apiKey: string = '') {
    // Initialize with the legacy single API key format
    this.apiKeys = {
      'openrouter': apiKey,
      'openai': '',
      'deepseek': ''
    };
    
    // Initialize base URLs with the default
    this.baseUrls = {
      'openrouter': this.defaultBaseUrl,
      'openai': this.defaultBaseUrl,
      'deepseek': this.defaultBaseUrl
    };
    
    // Try to load saved API keys and base URLs from localStorage
    this.loadApiKeys();
    this.loadBaseUrls();
  }
  
  loadApiKeys() {
    try {
      const savedApiKeys = localStorage.getItem('api_keys');
      if (savedApiKeys) {
        this.apiKeys = JSON.parse(savedApiKeys);
      }
    } catch (error) {
      console.error("Failed to load API keys from localStorage:", error);
    }
  }

  saveApiKeys() {
    try {
      localStorage.setItem('api_keys', JSON.stringify(this.apiKeys));
    } catch (error) {
      console.error("Failed to save API keys to localStorage:", error);
    }
  }
  
  loadBaseUrls() {
    try {
      const savedBaseUrls = localStorage.getItem('base_urls');
      if (savedBaseUrls) {
        this.baseUrls = JSON.parse(savedBaseUrls);
      }
    } catch (error) {
      console.error("Failed to load base URLs from localStorage:", error);
      // Ensure default URL is set
      this.baseUrls['openrouter'] = this.defaultBaseUrl;
      this.baseUrls['openai'] = this.defaultBaseUrl;
      this.baseUrls['deepseek'] = this.defaultBaseUrl;
    }
  }

  saveBaseUrls() {
    try {
      localStorage.setItem('base_urls', JSON.stringify(this.baseUrls));
    } catch (error) {
      console.error("Failed to save base URLs to localStorage:", error);
    }
  }

  setApiKey(key: string, provider: string = 'openai') {
    this.apiKeys[provider] = key;
    this.saveApiKeys();
  }

  getApiKey(provider: string = 'openai'): string {
    return this.apiKeys[provider] || '';
  }
  
  getAllApiKeys(): Record<string, string> {
    return {...this.apiKeys};
  }
  
  setBaseUrl(url: string, provider: string = 'openai') {
    // Always set to OpenRouter URL for all providers
    this.baseUrls[provider] = this.defaultBaseUrl;
    this.saveBaseUrls();
  }

  getBaseUrl(provider: string = 'openai'): string {
    return this.baseUrls[provider] || this.defaultBaseUrl;
  }
  
  getAllBaseUrls(): Record<string, string> {
    return {...this.baseUrls};
  }

  async sendMessage(
    messages: Message[], 
    model: string = 'openai/gpt-4o',
    temperature: number = 0.7,
    maxTokens: number = 1000
  ): Promise<string> {
    // Get the provider from the model string (e.g., 'openai/gpt-4o' -> 'openai')
    const provider = model.split('/')[0].toLowerCase();
    
    // Get the API key for the specific provider 
    const apiKey = this.getApiKey(provider);
    
    if (!apiKey) {
      throw new Error(`API key not set for ${provider}. Please set your API key in the settings.`);
    }
    
    // Always use OpenRouter base URL
    const baseUrl = this.defaultBaseUrl;

    const openRouterMessages: OpenRouterMessage[] = messages.map(message => {
      // Handle messages with images
      if (message.has_images && message.images && message.images.length > 0) {
        return {
          role: message.role,
          content: [
            {
              type: "text",
              text: message.content
            },
            ...message.images.map(imageUrl => ({
              type: "image_url",
              image_url: { url: imageUrl }
            }))
          ]
        } as unknown as OpenRouterMessage;
      }
      // Regular text message
      return {
        role: message.role,
        content: message.content
      };
    });

    const payload: OpenRouterRequest = {
      model,
      messages: openRouterMessages,
      temperature,
      max_tokens: maxTokens,
      stream: false
    };

    try {
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Sparky AI'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API error: ${errorData.error?.message || response.statusText}`);
      }
      
      const data: OpenRouterResponse = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error sending message to API:', error);
      throw error;
    }
  }

  createEmptyChat(): Chat {
    return {
      id: uuidv4(),
      title: 'New Chat',
      messages: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  createMessage(role: Message['role'], content: string, images?: string[]): Message {
    return {
      id: uuidv4(),
      chat_id: '', // This will be set when added to a chat
      role,
      content,
      created_at: new Date().toISOString(),
      has_images: images && images.length > 0 ? true : false,
      images
    };
  }

  generateTitle(messages: Message[]): string {
    if (messages.length === 0) return 'New Chat';
    
    const firstUserMessage = messages.find(msg => msg.role === 'user');
    if (!firstUserMessage) return 'New Chat';
    
    const content = firstUserMessage.content;
    if (content.length <= 30) return content;
    
    return content.substring(0, 27) + '...';
  }
}

// Initialize with legacy key from localStorage if available
export const chatService = new ChatService(
  localStorage.getItem('openrouter_api_key') || ''
);
