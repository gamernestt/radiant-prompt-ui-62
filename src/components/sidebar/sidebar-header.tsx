
import { Zap, X } from "lucide-react";
import { GradientText } from "@/components/gradient-text";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarHeaderProps {
  onToggle: () => void;
}

export function SidebarHeader({ onToggle }: SidebarHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
      <div className="flex items-center gap-2">
        <Zap className="h-6 w-6 text-accent animate-pulse-subtle" />
        <GradientText className="text-xl">Sparky AI</GradientText>
      </div>
      {isMobile && (
        <Button variant="ghost" size="icon" onClick={onToggle}>
          <X className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
