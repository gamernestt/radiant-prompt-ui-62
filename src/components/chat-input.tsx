
import { useRef, useState } from "react";
import { ArrowUp, Camera, MoreVertical, Plus, Image, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useChat } from "@/contexts/chat-context";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { VoiceAssistant } from "./voice-assistant";
import { ChatSearch } from "./chat-search";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export function ChatInput() {
  const { sendMessage, isLoading } = useChat();
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [imagePrompt, setImagePrompt] = useState("");
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  
  const handleSubmit = async () => {
    if (!input.trim()) return;
    
    try {
      await sendMessage(input);
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleVoiceTranscript = (text: string) => {
    setInput(text);
    // Focus the textarea after a voice transcript
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };
  
  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a description for the image you want to generate",
        variant: "destructive",
      });
      return;
    }
    
    setGeneratingImage(true);
    setGeneratedImageUrl(null);
    
    try {
      // For a quick demo, we'll use a placeholder API
      // In a real implementation, you would call a real AI image generation API
      const loadingToastId = toast({
        title: "Generating image",
        description: "Please wait while we create your image...",
      });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Use a placeholder image service
      const width = 512;
      const height = 512;
      const imageUrl = `https://source.unsplash.com/random/${width}x${height}/?${encodeURIComponent(imagePrompt)}`;
      
      setGeneratedImageUrl(imageUrl);
      toast({
        title: "Image generated",
        description: "Your image has been created successfully!",
      });
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "Error",
        description: "Failed to generate image. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setGeneratingImage(false);
    }
  };
  
  const handleInsertImage = async () => {
    if (generatedImageUrl) {
      // In a real implementation, you might want to upload this image to a storage service
      // and send the URL in the message
      const imageMessage = `![Generated Image](${generatedImageUrl})\n\n${imagePrompt}`;
      await sendMessage(imageMessage);
      
      // Reset the dialog
      setImageDialogOpen(false);
      setImagePrompt("");
      setGeneratedImageUrl(null);
    }
  };

  return (
    <>
      <div className="p-4 border-t border-border">
        <div
          className={cn(
            "flex items-end gap-2 rounded-lg border bg-background/95 p-2",
            "shadow-[0_0_15px_rgba(0,0,0,0.1)]",
            "backdrop-blur-sm",
            "transition-colors focus-within:ring-1 focus-within:ring-ring",
            "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-b before:from-primary/5 before:to-transparent before:opacity-50",
            "gradient-border"
          )}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
              >
                <Plus className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={() => setImageDialogOpen(true)}>
                <Image className="mr-2 h-4 w-4" />
                Generate Image
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                toast({
                  title: "Upload Files",
                  description: "File upload feature coming soon!",
                });
              }}>
                <FileText className="mr-2 h-4 w-4" />
                Upload Files
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                toast({
                  title: "Camera",
                  description: "Camera feature coming soon!",
                });
              }}>
                <Camera className="mr-2 h-4 w-4" />
                Camera
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Textarea
            ref={textareaRef}
            placeholder="Message..."
            className="min-h-[60px] flex-1 resize-none border-0 p-2 focus-visible:ring-0"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          
          <div className="flex items-center gap-1">
            <ChatSearch />
            <VoiceAssistant onTranscript={handleVoiceTranscript} isLoading={isLoading} />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setImageDialogOpen(true)}>
                  <Image className="mr-2 h-4 w-4" />
                  Generate Image
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  toast({
                    title: "Files",
                    description: "File upload feature coming soon!",
                  });
                }}>
                  <FileText className="mr-2 h-4 w-4" />
                  Files
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  toast({
                    title: "Camera",
                    description: "Camera feature coming soon!",
                  });
                }}>
                  <Camera className="mr-2 h-4 w-4" />
                  Camera
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button
              size="icon"
              className="h-8 w-8 shrink-0 bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90"
              onClick={handleSubmit}
              disabled={!input.trim() || isLoading}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {/* Image Generation Dialog */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Image</DialogTitle>
            <DialogDescription>
              Enter a description for the image you want to generate.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="prompt">Image description</Label>
              <Textarea
                id="prompt"
                placeholder="A serene lake surrounded by mountains at sunset..."
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
            
            <Button 
              onClick={handleGenerateImage}
              className="w-full"
              disabled={generatingImage || !imagePrompt.trim()}
            >
              {generatingImage ? "Generating..." : "Generate Image"}
            </Button>
            
            {generatedImageUrl && (
              <div className="space-y-2">
                <div className="border rounded-md p-1">
                  <img 
                    src={generatedImageUrl} 
                    alt="Generated" 
                    className="w-full h-auto rounded" 
                  />
                </div>
                <Button 
                  onClick={handleInsertImage}
                  variant="secondary"
                  className="w-full"
                >
                  Insert into Chat
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
