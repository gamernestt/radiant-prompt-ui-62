
import { createContext, useContext, useEffect, useState } from "react";
import { Chat, Message, AIModels, defaultModels } from "@/types/chat";
import { chatService } from "@/services/chat-service";
import { useToast } from "@/hooks/use-toast";

interface ChatContextProps {
  chats: Chat[];
  currentChat: Chat | null;
  activeModel: AIModels;
  isLoading: boolean;
  sendMessage: (content: string, images?: string[]) => Promise<void>;
  createNewChat: () => void;
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

  useEffect(() => {
    // Load chats from localStorage
    const savedChats = localStorage.getItem("chats");
    if (savedChats) {
      try {
        const parsedChats: Chat[] = JSON.parse(savedChats);
        // Convert date strings back to Date objects
        const processedChats = parsedChats.map(chat => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          updatedAt: new Date(chat.updatedAt),
          messages: chat.messages.map(msg => ({
            ...msg,
            createdAt: new Date(msg.createdAt)
          }))
        }));
        setChats(processedChats);
        
        // Set current chat if there's a saved one
        const lastChatId = localStorage.getItem("lastChatId");
        if (lastChatId) {
          const foundChat = processedChats.find(chat => chat.id === lastChatId);
          if (foundChat) {
            setCurrentChatState(foundChat);
          } else if (processedChats.length > 0) {
            setCurrentChatState(processedChats[0]);
          }
        } else if (processedChats.length > 0) {
          setCurrentChatState(processedChats[0]);
        }
      } catch (error) {
        console.error("Failed to parse saved chats:", error);
        toast({
          title: "Error",
          description: "Failed to load saved chats",
          variant: "destructive"
        });
      }
    } else {
      // Create a new chat if no chats exist
      createNewChat();
    }

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
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem("chats", JSON.stringify(chats));
    }
  }, [chats]);

  // Save current chat to localStorage
  useEffect(() => {
    if (currentChat) {
      localStorage.setItem("lastChatId", currentChat.id);
    }
  }, [currentChat]);

  // Save active model to localStorage
  useEffect(() => {
    localStorage.setItem("activeModel", JSON.stringify(activeModel));
  }, [activeModel]);

  const createNewChat = () => {
    const newChat = chatService.createEmptyChat();
    setChats(prev => [newChat, ...prev]);
    setCurrentChatState(newChat);
    return newChat;
  };

  const setCurrentChat = (chatId: string) => {
    const chat = chats.find(c => c.id === chatId);
    if (chat) {
      setCurrentChatState(chat);
    }
  };

  const updateChat = (updatedChat: Chat) => {
    setChats(prev => 
      prev.map(chat => (chat.id === updatedChat.id ? updatedChat : chat))
    );
    if (currentChat?.id === updatedChat.id) {
      setCurrentChatState(updatedChat);
    }
  };

  const deleteChat = (chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    if (currentChat?.id === chatId) {
      const remainingChats = chats.filter(chat => chat.id !== chatId);
      if (remainingChats.length > 0) {
        setCurrentChatState(remainingChats[0]);
      } else {
        createNewChat();
      }
    }
  };

  const clearChats = () => {
    setChats([]);
    createNewChat();
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
    if (!currentChat) return;

    try {
      setIsLoading(true);
      
      // Add user message
      const userMessage = chatService.createMessage("user", content, images);
      
      // Update chat with user message
      const updatedChat = {
        ...currentChat,
        messages: [...currentChat.messages, userMessage],
        updatedAt: new Date()
      };
      
      // Update title if it's the first message
      if (currentChat.messages.length === 0) {
        updatedChat.title = chatService.generateTitle([userMessage]);
      }
      
      updateChat(updatedChat);
      
      // Send message to API
      const assistantContent = await chatService.sendMessage(
        updatedChat.messages,
        activeModel.id
      );
      
      // Add assistant response
      const assistantMessage = chatService.createMessage("assistant", assistantContent);
      
      // Update chat with assistant message
      const finalChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, assistantMessage],
        updatedAt: new Date()
      };
      
      updateChat(finalChat);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
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
