
import { ThemeProvider } from "@/components/theme-provider";
import { ChatProvider } from "@/contexts/chat-context";
import { ChatLayout } from "@/components/chat-layout";

const Index = () => {
  return (
    <ThemeProvider>
      <ChatProvider>
        <ChatLayout />
      </ChatProvider>
    </ThemeProvider>
  );
};

export default Index;
