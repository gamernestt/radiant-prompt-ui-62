
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useChat } from "@/contexts/chat-context";
import { cn } from "@/lib/utils";

export function ChatSearch() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [matchCount, setMatchCount] = useState(0);
  const { currentChat } = useChat();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (searchQuery && currentChat?.messages) {
      // Count matches in the current chat
      const count = currentChat.messages.reduce((acc, message) => {
        const matches = (message.content.match(new RegExp(searchQuery, "gi")) || []).length;
        return acc + matches;
      }, 0);
      setMatchCount(count);
    } else {
      setMatchCount(0);
    }
  }, [searchQuery, currentChat]);

  const handleToggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setSearchQuery("");
    }
  };

  return (
    <div className={cn("flex items-center", isSearchOpen ? "w-full" : "w-auto")}>
      {isSearchOpen && (
        <div className="relative w-full animate-fade-in">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search in conversation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-16"
          />
          {searchQuery && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              {matchCount} {matchCount === 1 ? "match" : "matches"}
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full rounded-l-none"
            onClick={() => setSearchQuery("")}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <Button
        variant={isSearchOpen ? "default" : "ghost"}
        size="icon"
        className={cn("h-8 w-8 shrink-0", isSearchOpen && "ml-2")}
        onClick={handleToggleSearch}
      >
        <Search className="h-4 w-4" />
      </Button>
    </div>
  );
}
