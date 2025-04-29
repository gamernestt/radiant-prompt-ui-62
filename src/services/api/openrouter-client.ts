
import { 
  OpenRouterRequest, 
  OpenRouterResponse,
  OpenRouterMessage,
  Message
} from '@/types/chat';

export class OpenRouterClient {
  private baseUrl: string = 'https://openrouter.ai/api/v1';
  
  constructor(private apiKey: string) {}
  
  async sendChatRequest(
    messages: Message[], 
    model: string,
    temperature: number = 0.7,
    maxTokens: number = 1000
  ): Promise<string> {
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
          'Authorization': `Bearer ${this.apiKey}`,
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
}
