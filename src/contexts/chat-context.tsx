import { createContext, useContext, useEffect, useState } from "react";
import { Chat, Message, MessageRole, AIModels, defaultModels } from "@/types/chat";
import { chatService } from "@/services/chat-service";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

interface ChatContextProps {
  chats: Chat[];
  currentChat: Chat | null;
  activeModel: AIModels;
  isLoading: boolean;
  sendMessage: (content: string, images?: string[]) => Promise<void>;
  createNewChat: () => Promise<Chat>;
  setCurrentChat: (chatId: string) => void;
  deleteChat: (chatId: string) => void;
  clearChats: () => void;
  setApiKey: (key: string) => void;
  getApiKey: () => string;
  setActiveModel: (model: AIModels) => void;
  availableModels: AIModels[];
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChatState] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availableModels] = useState<AIModels[]>(defaultModels);
  const [activeModel, setActiveModelState] = useState<AIModels>(defaultModels[0]);
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUser(data.session.user);
        loadChats(data.session.user.id);
      }
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
          loadChats(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setChats([]);
          setCurrentChatState(null);
        }
      }
    );
    
    const savedModel = localStorage.getItem("activeModel");
    if (savedModel) {
      try {
        const model = JSON.parse(savedModel);
        setActiveModelState(model);
      } catch (error) {
        console.error("Failed to parse saved model:", error);
      }
    }
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const loadChats = async (userId: string) => {
    try {
      const { data: chatsData, error: chatsError } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
        
      if (chatsError) throw chatsError;
      
      if (!chatsData || chatsData.length === 0) {
        const newChat = await createNewChatInDb(userId);
        setChats([newChat]);
        setCurrentChatState(newChat);
        return;
      }
      
      const formattedChats: Chat[] = chatsData.map(chat => ({
        id: chat.id,
        title: chat.title,
        messages: [],
        created_at: chat.created_at,
        updated_at: chat.updated_at,
        user_id: chat.user_id
      }));
      
      const lastChatId = localStorage.getItem("lastChatId");
      let currentChatId = lastChatId;
      
      if (!lastChatId || !formattedChats.find(chat => chat.id === lastChatId)) {
        currentChatId = formattedChats[0].id;
      }
      
      const currentChatWithMessages = await loadChatMessages(currentChatId as string);
      
      setChats(formattedChats);
      setCurrentChatState(currentChatWithMessages);
      
    } catch (error) {
      console.error("Failed to load chats:", error);
      toast({
        title: "Error",
        description: "Failed to load your chats",
        variant: "destructive"
      });
    }
  };

  const loadChatMessages = async (chatId: string): Promise<Chat> => {
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
        ...msg,
        role: msg.role as MessageRole
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
      throw error;
    }
  };

  useEffect(() => {
    localStorage.setItem("activeModel", JSON.stringify(activeModel));
  }, [activeModel]);
  
  useEffect(() => {
    if (currentChat) {
      localStorage.setItem("lastChatId", currentChat.id);
    }
  }, [currentChat]);

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

  const setCurrentChat = async (chatId: string) => {
    try {
      const chat = chats.find(c => c.id === chatId);
      
      if (chat) {
        if (!chat.messages || chat.messages.length === 0) {
          const chatWithMessages = await loadChatMessages(chatId);
          setCurrentChatState(chatWithMessages);
          
          setChats(prev => 
            prev.map(c => c.id === chatId ? chatWithMessages : c)
          );
        } else {
          setCurrentChatState(chat);
        }
      }
    } catch (error) {
      console.error("Error setting current chat:", error);
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId);
        
      if (error) throw error;
      
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      
      if (currentChat?.id === chatId) {
        const remainingChats = chats.filter(chat => chat.id !== chatId);
        if (remainingChats.length > 0) {
          setCurrentChat(remainingChats[0].id);
        } else {
          createNewChat();
        }
      }
      
      toast({
        title: "Chat deleted",
        description: "The chat has been deleted successfully",
      });
    } catch (error) {
      console.error("Failed to delete chat:", error);
      toast({
        title: "Error",
        description: "Failed to delete the chat",
        variant: "destructive"
      });
    }
  };

  const clearChats = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      setChats([]);
      setCurrentChatState(null);
      
      createNewChat();
      
      toast({
        title: "Chats cleared",
        description: "All chats have been deleted",
      });
    } catch (error) {
      console.error("Failed to clear chats:", error);
      toast({
        title: "Error",
        description: "Failed to clear chats",
        variant: "destructive"
      });
    }
  };

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

  const sendMessage = async (content: string, images?: string[]) => {
    if (!currentChat || !user) return;

    try {
      setIsLoading(true);
      
      const userMessageData = {
        id: uuidv4(),
        chat_id: currentChat.id,
        role: "user" as MessageRole,
        content: content,
        created_at: new Date().toISOString(),
        has_images: images && images.length > 0 ? true : false
      };
      
      const { error: msgError } = await supabase
        .from('messages')
        .insert(userMessageData);
        
      if (msgError) throw msgError;
      
      if (!currentChat.messages || currentChat.messages.length === 0) {
        const newTitle = content.length > 30 ? content.substring(0, 27) + '...' : content;
        
        const { error: titleError } = await supabase
          .from('chats')
          .update({ title: newTitle, updated_at: new Date().toISOString() })
          .eq('id', currentChat.id);
          
        if (titleError) throw titleError;
      } else {
        const { error: updateError } = await supabase
          .from('chats')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', currentChat.id);
          
        if (updateError) throw updateError;
      }
      
      const userMessage: Message = {
        ...userMessageData,
        images
      };
      
      const updatedMessages = [...(currentChat.messages || []), userMessage];
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
      
      const assistantContent = await chatService.sendMessage(
        updatedMessages,
        activeModel.id
      );
      
      const assistantMessageData = {
        id: uuidv4(),
        chat_id: currentChat.id,
        role: "assistant" as MessageRole,
        content: assistantContent,
        created_at: new Date().toISOString(),
        has_images: false
      };
      
      const assistantMessage: Message = {
        ...assistantMessageData
      };
      
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
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: ChatContextProps = {
    chats,
    currentChat,
    activeModel,
    isLoading,
    sendMessage,
    createNewChat,
    setCurrentChat,
    deleteChat,
    clearChats,
    setApiKey,
    getApiKey,
    setActiveModel,
    availableModels
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
