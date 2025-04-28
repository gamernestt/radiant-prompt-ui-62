
import { useState } from "react";
import { LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ModelSettingsDialog } from "./model-settings-dialog";

interface SidebarFooterProps {
  isAdmin: boolean;
}

export function SidebarFooter({ isAdmin }: SidebarFooterProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("sparky_user");
    navigate("/auth");
  };

  return (
    <div className="p-4 border-t border-sidebar-border flex items-center justify-between">
      <div className="flex items-center gap-2">
        {/* Only show settings button if user is admin */}
        {isAdmin && (
          <>
            <Button variant="ghost" size="icon" onClick={() => setIsSettingsOpen(true)}>
              <Settings className="h-5 w-5" />
            </Button>
            <ModelSettingsDialog isOpen={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
          </>
        )}
        
        <ThemeSwitcher />
      </div>
      
      <Button 
        variant="outline" 
        size="icon"
        onClick={handleLogout}
        className="rounded-lg"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
