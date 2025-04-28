import { useState } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModelSettingsDialog } from "./model-settings";

interface SidebarFooterProps {
  isAdmin: boolean;
}

export function SidebarFooter({ isAdmin }: SidebarFooterProps) {
  const [isModelSettingsOpen, setIsModelSettingsOpen] = useState(false);

  return (
    <>
      <div className="mt-auto p-4 flex items-center justify-center">
        {isAdmin && (
          <Button variant="outline" size="sm" onClick={() => setIsModelSettingsOpen(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        )}
      </div>

      <ModelSettingsDialog
        isOpen={isModelSettingsOpen}
        onOpenChange={setIsModelSettingsOpen}
      />
    </>
  );
}
