
import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCheck } from "@/hooks/use-admin-check";

import { SidebarHeader } from "./sidebar/sidebar-header";
import { NewChatButton } from "./sidebar/new-chat-button";
import { ChatList } from "./sidebar/chat-list";
import { SidebarFooter } from "./sidebar/sidebar-footer";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function AppSidebar({ isOpen, onToggle }: SidebarProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  
  // Use the admin check hook to determine if user is admin
  const { isAdmin } = useAdminCheck(user?.id);
  
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setUser(data.session.user);
      } else {
        navigate("/auth");
      }
    };
    
    checkSession();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          navigate("/auth");
        } else if (session) {
          setUser(session.user);
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-40",
          isOpen ? "block" : "hidden",
          !isMobile && "hidden"
        )}
        onClick={onToggle}
      />
      <aside 
        className={cn(
          "flex flex-col bg-sidebar fixed top-0 bottom-0 border-r border-border z-50",
          "rounded-r-2xl shadow-lg",
          "w-[280px] transition-transform duration-300 ease-in-out",
          isMobile && !isOpen && "-translate-x-full"
        )}
      >
        <SidebarHeader onToggle={onToggle} />
        <NewChatButton onToggle={onToggle} />
        <ChatList onToggle={onToggle} />
        <SidebarFooter isAdmin={isAdmin} />
      </aside>
      
      {/* Mobile menu button */}
      {isMobile && (
        <Button
          variant="outline"
          size="icon"
          onClick={onToggle}
          className="fixed left-4 top-4 z-30 rounded-lg"
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}
    </>
  );
}
