
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { ChatProvider } from "@/contexts/chat-context";
import { TooltipProvider } from "@/components/ui/tooltip";
import App from './App.tsx'
import './index.css'

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <ChatProvider>
          <App />
        </ChatProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);
