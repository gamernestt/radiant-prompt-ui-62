
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Chat, Message, MessageRole } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';

export const useChatDatabase = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const loadChats = async (userId: string): Promise<Chat[]> => {
    try {
      const { data: chatsData, error: chatsError } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
        
      if (chatsError) throw chatsError;
      
      if (!chatsData || chatsData.length === 0) {
        const newChat = await createNewChatInDb(userId);
        return [newChat];
      }
      
      const formattedChats: Chat[] = chatsData.map(chat => ({
        id: chat.id,
        title: chat.title,
        messages: [],
        created_at: chat.created_at,
        updated_at: chat.updated_at,
        user_id: chat.user_id
      }));
      
      return formattedChats;
    } catch (error) {
      console.error("Failed to load chats:", error);
      toast({
        title: "Error",
        description: "Failed to load your chats",
        variant: "destructive"
      });
      return [];
    }
  };

  const loadChatMessages = async (chatId: string): Promise<Chat | null> => {
    try {
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .single();
        
      if (chatError) throw chatError;
      
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });
        
      if (messagesError) throw messagesError;
      
      const typedMessages: Message[] = (messagesData || []).map(msg => ({
        id: msg.id,
        chat_id: msg.chat_id,
        role: msg.role as MessageRole,
        content: msg.content,
        created_at: msg.created_at,
        has_images: msg.has_images || false
      }));
      
      const chat: Chat = {
        id: chatData.id,
        title: chatData.title,
        messages: typedMessages,
        created_at: chatData.created_at,
        updated_at: chatData.updated_at,
        user_id: chatData.user_id
      };
      
      return chat;
    } catch (error) {
      console.error("Failed to load chat messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
      return null;
    }
  };

  const createNewChatInDb = async (userId: string): Promise<Chat> => {
    try {
      const newChat = {
        id: uuidv4(),
        user_id: userId,
        title: 'New Chat',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('chats')
        .insert(newChat);
        
      if (error) throw error;
      
      return {
        ...newChat,
        messages: []
      };
    } catch (error) {
      console.error("Failed to create new chat:", error);
      toast({
        title: "Error",
        description: "Failed to create a new chat",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId);
        
      if (error) throw error;
      
      toast({
        title: "Chat deleted",
        description: "The chat has been deleted successfully",
      });
      
      return true;
    } catch (error) {
      console.error("Failed to delete chat:", error);
      toast({
        title: "Error",
        description: "Failed to delete the chat",
        variant: "destructive"
      });
      return false;
    }
  };

  const clearChats = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('user_id', userId);
        
      if (error) throw error;
      
      toast({
        title: "Chats cleared",
        description: "All chats have been deleted",
      });
      
      return true;
    } catch (error) {
      console.error("Failed to clear chats:", error);
      toast({
        title: "Error",
        description: "Failed to clear chats",
        variant: "destructive"
      });
      return false;
    }
  };

  const saveUserMessage = async (chatId: string, content: string, hasImages: boolean = false, images?: string[]) => {
    setIsLoading(true);
    try {
      const userMessageData = {
        id: uuidv4(),
        chat_id: chatId,
        role: "user" as MessageRole,
        content: content,
        created_at: new Date().toISOString(),
        has_images: hasImages
      };
      
      const { error: msgError } = await supabase
        .from('messages')
        .insert(userMessageData);
        
      if (msgError) throw msgError;
      
      // Update chat's updated_at timestamp
      // Here's the fix: replacing .is('title', 'New Chat') with .eq('title', 'New Chat')
      const { error: updateError } = await supabase
        .from('chats')
        .update({ 
          updated_at: new Date().toISOString(),
          ...(content.length > 0 && !hasImages ? { title: content.length > 30 ? content.substring(0, 27) + '...' : content } : {})
        })
        .eq('id', chatId)
        .eq('title', 'New Chat');
        
      if (updateError) throw updateError;

      return {
        ...userMessageData,
        images
      };
    } catch (error) {
      console.error("Error saving user message:", error);
      toast({
        title: "Error",
        description: "Failed to save message",
        variant: "destructive"
      });
      throw error;
    }
  };

  const saveAssistantMessage = async (chatId: string, content: string) => {
    try {
      const assistantMessageData = {
        id: uuidv4(),
        chat_id: chatId,
        role: "assistant" as MessageRole,
        content: content,
        created_at: new Date().toISOString(),
        has_images: false
      };
      
      const { error } = await supabase
        .from('messages')
        .insert(assistantMessageData);
        
      if (error) throw error;
      
      return assistantMessageData;
    } catch (error) {
      console.error("Error saving assistant message:", error);
      toast({
        title: "Error",
        description: "Failed to save AI response",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    loadChats,
    loadChatMessages,
    createNewChatInDb,
    deleteChat,
    clearChats,
    saveUserMessage,
    saveAssistantMessage
  };
};
