
import { v4 as uuidv4 } from 'uuid';
import { 
  Message, 
  Chat, 
  OpenRouterRequest, 
  OpenRouterResponse, 
  OpenRouterMessage 
} from '@/types/chat';

export class ChatService {
  private apiKey: string;
  private baseUrl: string = 'https://openrouter.ai/api/v1';
  
  constructor(apiKey: string = '') {
    this.apiKey = apiKey;
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey;
  }

  getApiKey(): string {
    return this.apiKey;
  }

  async sendMessage(
    messages: Message[], 
    model: string = 'openai/gpt-4o',
    temperature: number = 0.7,
    maxTokens: number = 1000
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('API key not set');
    }

    const openRouterMessages: OpenRouterMessage[] = messages.map(message => {
      // Handle messages with images
      if (message.images && message.images.length > 0) {
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
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Radiant Chat UI'
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
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  createMessage(role: Message['role'], content: string, images?: string[]): Message {
    return {
      id: uuidv4(),
      role,
      content,
      createdAt: new Date(),
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

export const chatService = new ChatService(
  localStorage.getItem('openrouter_api_key') || ''
);
