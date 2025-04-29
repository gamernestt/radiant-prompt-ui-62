
import { useState } from "react";
import { useChat } from "@/contexts/chat-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AddModelFormProps {
  isAdmin: boolean;
}

export function AddModelForm({ isAdmin }: AddModelFormProps) {
  const { addModel } = useChat();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [modelName, setModelName] = useState("");
  const [modelId, setModelId] = useState("");
  const [modelDescription, setModelDescription] = useState("");
  
  const handleAddModel = () => {
    if (!modelName.trim() || !modelId.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both name and ID for the model.",
        variant: "destructive",
      });
      return;
    }
    
    // Make sure it's an OpenAI model
    if (!modelId.toLowerCase().startsWith("openai/")) {
      toast({
        title: "Invalid model ID",
        description: "Only OpenAI models are allowed. Model ID must start with 'openai/'",
        variant: "destructive",
      });
      return;
    }
    
    // Create the model object
    const newModel = {
      id: modelId,
      name: modelName,
      provider: "OpenAI", // Always set to OpenAI
      description: modelDescription
    };
    
    // Add the model
    addModel(newModel);
    
    // Reset form
    setModelName("");
    setModelId("");
    setModelDescription("");
    setIsAdding(false);
  };
  
  if (!isAdmin) return null;
  
  if (!isAdding) {
    return (
      <div className="mt-4">
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2"
          onClick={() => setIsAdding(true)}
        >
          <PlusCircle className="h-4 w-4" />
          Add OpenAI Model
        </Button>
      </div>
    );
  }
  
  return (
    <div className="border p-4 rounded-md mt-4 bg-secondary/20">
      <h3 className="font-medium mb-2">Add OpenAI Model</h3>
      <div className="space-y-3">
        <div>
          <Label htmlFor="model-name">Model Name</Label>
          <Input 
            id="model-name"
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            placeholder="GPT-4o Turbo"
          />
        </div>
        
        <div>
          <Label htmlFor="model-id">Model ID</Label>
          <Input 
            id="model-id"
            value={modelId}
            onChange={(e) => setModelId(e.target.value)}
            placeholder="openai/gpt-4o-turbo"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Must start with "openai/" - only OpenAI models are allowed
          </p>
        </div>
        
        <div>
          <Label htmlFor="model-description">Description (optional)</Label>
          <Input 
            id="model-description"
            value={modelDescription}
            onChange={(e) => setModelDescription(e.target.value)}
            placeholder="Advanced OpenAI model"
          />
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            onClick={() => setIsAdding(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddModel}
            className="flex-1 bg-gradient-to-r from-accent to-primary hover:opacity-90"
          >
            Add Model
          </Button>
        </div>
      </div>
    </div>
  );
}
