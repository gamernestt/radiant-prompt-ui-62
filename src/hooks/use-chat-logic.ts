
import { useState, useEffect } from "react";
import { Chat, Message } from "@/types/chat";
import { useChatDatabase } from "./use-chat-database";
import { useChatSettings } from "./use-chat-settings";
import { useAuthState } from "./use-auth-state";
import { chatService } from "@/services/chat-service";

export const useChatLogic = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChatState] = useState<Chat | null>(null);
  const { user } = useAuthState();
  const { 
    isLoading, 
    loadChats, 
    loadChatMessages, 
    createNewChatInDb,
    deleteChat: deleteDbChat,
    clearChats: clearDbChats,
    saveUserMessage,
    saveAssistantMessage 
  } = useChatDatabase();
  
  const { activeModel } = useChatSettings();

  useEffect(() => {
    if (user) {
      loadUserChats(user.id);
    } else {
      setChats([]);
      setCurrentChatState(null);
    }
  }, [user]);

  useEffect(() => {
    if (currentChat) {
      localStorage.setItem("lastChatId", currentChat.id);
    }
  }, [currentChat]);

  const loadUserChats = async (userId: string) => {
    const loadedChats = await loadChats(userId);
    setChats(loadedChats);
    
    const lastChatId = localStorage.getItem("lastChatId");
    let currentChatId = lastChatId;
    
    if (!lastChatId || !loadedChats.find(chat => chat.id === lastChatId)) {
      currentChatId = loadedChats[0]?.id;
    }
    
    if (currentChatId) {
      const currentChatWithMessages = await loadChatMessages(currentChatId);
      if (currentChatWithMessages) {
        setCurrentChatState(currentChatWithMessages);
      }
    }
  };

  const setCurrentChat = async (chatId: string) => {
    try {
      const chat = chats.find(c => c.id === chatId);
      
      if (chat) {
        if (!chat.messages || chat.messages.length === 0) {
          const chatWithMessages = await loadChatMessages(chatId);
          if (chatWithMessages) {
            setCurrentChatState(chatWithMessages);
            setChats(prev => 
              prev.map(c => c.id === chatId ? chatWithMessages : c)
            );
          }
        } else {
          setCurrentChatState(chat);
        }
      }
    } catch (error) {
      console.error("Error setting current chat:", error);
    }
  };

  const createNewChat = async () => {
    if (!user) return {} as Chat;
    
    try {
      const newChat = await createNewChatInDb(user.id);
      setChats(prev => [newChat, ...prev]);
      setCurrentChatState(newChat);
      return newChat;
    } catch (error) {
      console.error("Error creating new chat:", error);
      return {} as Chat;
    }
  };

  const deleteChat = async (chatId: string) => {
    if (!user) return;
    
    const success = await deleteDbChat(chatId);
    if (success) {
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      
      if (currentChat?.id === chatId) {
        const remainingChats = chats.filter(chat => chat.id !== chatId);
        if (remainingChats.length > 0) {
          setCurrentChat(remainingChats[0].id);
        } else {
          createNewChat();
        }
      }
    }
  };

  const clearChats = async () => {
    if (!user) return;
    
    const success = await clearDbChats(user.id);
    if (success) {
      setChats([]);
      setCurrentChatState(null);
      createNewChat();
    }
  };

  const sendMessage = async (content: string, images?: string[]) => {
    if (!currentChat || !user) return;

    try {
      // Save user message to the database
      const userMessage = await saveUserMessage(
        currentChat.id, 
        content, 
        images && images.length > 0, 
        images
      );
      
      const updatedMessages = [...(currentChat.messages || []), userMessage];
      
      // Update local state with the user message
      const updatedChat = {
        ...currentChat,
        messages: updatedMessages,
        title: updatedMessages.length === 1 ? (content.length > 30 ? content.substring(0, 27) + '...' : content) : currentChat.title,
        updated_at: new Date().toISOString()
      };
      
      setCurrentChatState(updatedChat);
      setChats(prev => 
        prev.map(chat => chat.id === currentChat.id ? {
          ...chat,
          title: updatedMessages.length === 1 ? (content.length > 30 ? content.substring(0, 27) + '...' : content) : chat.title,
          updated_at: new Date().toISOString()
        } : chat)
      );
      
      // Get response from AI service
      const assistantContent = await chatService.sendMessage(
        updatedMessages,
        activeModel.id
      );
      
      // Save assistant message to database
      const assistantMessage = await saveAssistantMessage(currentChat.id, assistantContent);
      
      // Update local state with the assistant message
      const finalMessages = [...updatedMessages, assistantMessage];
      const finalChat = {
        ...updatedChat,
        messages: finalMessages
      };
      
      setCurrentChatState(finalChat);
      setChats(prev => 
        prev.map(chat => chat.id === currentChat.id ? {
          ...chat,
          updated_at: new Date().toISOString()
        } : chat)
      );
    } catch (error: any) {
      console.error("Error sending message:", error);
    }
  };

  return {
    chats,
    currentChat,
    isLoading,
    sendMessage,
    createNewChat,
    setCurrentChat,
    deleteChat,
    clearChats
  };
};
