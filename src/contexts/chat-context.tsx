
import { createContext, useContext } from "react";
import { Chat, Message, AIModels } from "@/types/chat";
import { useChatLogic } from "@/hooks/use-chat-logic";
import { useChatSettings } from "@/hooks/use-chat-settings";

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
  const { 
    chats,
    currentChat,
    isLoading,
    sendMessage,
    createNewChat,
    setCurrentChat,
    deleteChat,
    clearChats
  } = useChatLogic();
  
  const {
    activeModel,
    availableModels,
    setActiveModel,
    setApiKey,
    getApiKey
  } = useChatSettings();

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
