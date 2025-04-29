
import { v4 as uuidv4 } from 'uuid';
import { Message, Chat } from '@/types/chat';

export class ChatUtilsService {
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
