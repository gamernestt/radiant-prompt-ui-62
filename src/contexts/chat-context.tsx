
import { createContext, useContext, useEffect, useState } from "react";
import { Chat, Message, AIModels, defaultModels } from "@/types/chat";
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
  createNewChat: () => Chat;
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
    // Check if user is logged in
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUser(data.session.user);
        loadChats(data.session.user.id);
      }
    };
    
    checkAuth();
    
    // Listen for auth changes
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
    
    // Load saved model if it exists
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

  // Load chats from Supabase
  const loadChats = async (userId: string) => {
    try {
      // Get chats
      const { data: chatsData, error: chatsError } = await supabase
        .from('chats')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });
        
      if (chatsError) throw chatsError;
      
      if (!chatsData || chatsData.length === 0) {
        // Create a new chat if none exist
        const newChat = await createNewChatInDb(userId);
        setChats([newChat]);
        setCurrentChatState(newChat);
        return;
      }
      
      // Get last chat id from localStorage
      const lastChatId = localStorage.getItem("lastChatId");
      let currentChatId = lastChatId;
      
      // If no last chat id or it doesn't exist in the loaded chats, use the first chat
      if (!lastChatId || !chatsData.find(chat => chat.id === lastChatId)) {
        currentChatId = chatsData[0].id;
      }
      
      // Load messages for current chat
      const currentChatWithMessages = await loadChatMessages(currentChatId as string);
      
      setChats(chatsData);
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
  
  // Load messages for a specific chat
  const loadChatMessages = async (chatId: string): Promise<Chat> => {
    try {
      // Get chat details
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .select('*')
        .eq('id', chatId)
        .single();
        
      if (chatError) throw chatError;
      
      // Get messages for this chat
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });
        
      if (messagesError) throw messagesError;
      
      return {
        ...chatData,
        messages: messagesData || []
      };
      
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

  // Save active model to localStorage
  useEffect(() => {
    localStorage.setItem("activeModel", JSON.stringify(activeModel));
  }, [activeModel]);
  
  // Save current chat ID to localStorage
  useEffect(() => {
    if (currentChat) {
      localStorage.setItem("lastChatId", currentChat.id);
    }
  }, [currentChat]);

  // Create a new chat in the database
  const createNewChatInDb = async (userId: string): Promise<Chat> => {
    try {
      const newChat = {
        id: uuidv4(),
        user_id: userId,
        title: 'New Chat',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        messages: []
      };
      
      const { error } = await supabase
        .from('chats')
        .insert(newChat);
        
      if (error) throw error;
      
      return newChat;
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

  const createNewChat = () => {
    if (!user) return {} as Chat;
    
    const createChat = async () => {
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
    
    return createChat();
  };

  const setCurrentChat = async (chatId: string) => {
    try {
      const chat = chats.find(c => c.id === chatId);
      
      if (chat) {
        // If chat has no messages loaded, fetch them
        if (!chat.messages || chat.messages.length === 0) {
          const chatWithMessages = await loadChatMessages(chatId);
          setCurrentChatState(chatWithMessages);
          
          // Update the chat in the chats array
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
      // Delete from database
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('id', chatId);
        
      if (error) throw error;
      
      // Update state
      setChats(prev => prev.filter(chat => chat.id !== chatId));
      
      // If deleted the current chat, set a new current chat
      if (currentChat?.id === chatId) {
        const remainingChats = chats.filter(chat => chat.id !== chatId);
        if (remainingChats.length > 0) {
          setCurrentChat(remainingChats[0].id);
        } else {
          // If no chats remain, create a new one
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
      // Delete all chats for the user
      const { error } = await supabase
        .from('chats')
        .delete()
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Clear state
      setChats([]);
      setCurrentChatState(null);
      
      // Create a new chat
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
      
      // Create user message
      const userMessage = {
        id: uuidv4(),
        chat_id: currentChat.id,
        role: "user",
        content: content,
        created_at: new Date().toISOString(),
        has_images: images && images.length > 0 ? true : false
      } as Message;
      
      // Save user message to database
      const { error: msgError } = await supabase
        .from('messages')
        .insert(userMessage);
        
      if (msgError) throw msgError;
      
      // Update chat title if it's the first message
      if (!currentChat.messages || currentChat.messages.length === 0) {
        const newTitle = content.length > 30 ? content.substring(0, 27) + '...' : content;
        
        const { error: titleError } = await supabase
          .from('chats')
          .update({ title: newTitle, updated_at: new Date().toISOString() })
          .eq('id', currentChat.id);
          
        if (titleError) throw titleError;
      } else {
        // Update chat timestamp
        const { error: updateError } = await supabase
          .from('chats')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', currentChat.id);
          
        if (updateError) throw updateError;
      }
      
      // Update local state with user message
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
      
      // Get AI response
      const assistantContent = await chatService.sendMessage(
        updatedMessages,
        activeModel.id
      );
      
      // Create assistant message
      const assistantMessage = {
        id: uuidv4(),
        chat_id: currentChat.id,
        role: "assistant",
        content: assistantContent,
        created_at: new Date().toISOString(),
        has_images: false
      } as Message;
      
      // Save assistant message to database
      const { error: assistantError } = await supabase
        .from('messages')
        .insert(assistantMessage);
        
      if (assistantError) throw assistantError;
      
      // Update local state with assistant message
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
