
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
  private baseUrl: string = 'https://openrouter.ai/api/v1';
  
  constructor(apiKey: string = '') {
    // Initialize with the legacy single API key format
    this.apiKeys = {
      'openrouter': apiKey
    };
    
    // Try to load saved API keys from localStorage
    this.loadApiKeys();
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

  setApiKey(key: string, provider: string = 'openrouter') {
    this.apiKeys[provider] = key;
    this.saveApiKeys();
  }

  getApiKey(provider: string = 'openrouter'): string {
    return this.apiKeys[provider] || '';
  }
  
  getAllApiKeys(): Record<string, string> {
    return {...this.apiKeys};
  }

  async sendMessage(
    messages: Message[], 
    model: string = 'openai/gpt-4o',
    temperature: number = 0.7,
    maxTokens: number = 1000
  ): Promise<string> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('API key not set');
    }

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
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
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
        throw new Error(`OpenRouter API error: ${errorData.error?.message || response.statusText}`);
      }
      
      const data: OpenRouterResponse = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error sending message to OpenRouter:', error);
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
