
import { useState } from "react";
import { useChat } from "@/contexts/chat-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [provider, setProvider] = useState("openai");
  
  const handleAddModel = () => {
    if (!modelName.trim() || !modelId.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both name and ID for the model.",
        variant: "destructive",
      });
      return;
    }
    
    // Make sure it's using correct prefix based on selected provider
    const lowercaseModelId = modelId.toLowerCase();
    const expectedPrefix = provider.toLowerCase() + "/";
    
    if (!lowercaseModelId.startsWith(expectedPrefix)) {
      const correctedModelId = expectedPrefix + (lowercaseModelId.startsWith(expectedPrefix) ? 
        lowercaseModelId.substring(expectedPrefix.length) : 
        lowercaseModelId);
      
      toast({
        title: "Model ID corrected",
        description: `Model ID should start with "${expectedPrefix}". Corrected to "${correctedModelId}"`,
      });
      
      // Update the model ID with the corrected version
      setModelId(correctedModelId);
      
      // Create the model object with corrected ID
      const newModel = {
        id: correctedModelId,
        name: modelName,
        provider: provider === 'openai' ? 'OpenAI' : 'Deepseek',
        description: modelDescription
      };
      
      // Add the model
      addModel(newModel);
    } else {
      // Create the model object
      const newModel = {
        id: modelId,
        name: modelName,
        provider: provider === 'openai' ? 'OpenAI' : 'Deepseek',
        description: modelDescription
      };
      
      // Add the model
      addModel(newModel);
    }
    
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
          Add Model
        </Button>
      </div>
    );
  }
  
  return (
    <div className="border p-4 rounded-md mt-4 bg-secondary/20">
      <h3 className="font-medium mb-2">Add New Model</h3>
      <div className="space-y-3">
        <div>
          <Label htmlFor="provider-select">Provider</Label>
          <Select value={provider} onValueChange={setProvider}>
            <SelectTrigger>
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="deepseek">Deepseek</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
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
            placeholder={provider === 'openai' ? "openai/gpt-4o-turbo" : "deepseek/model-name"}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Must start with "{provider}/" - only {provider === 'openai' ? 'OpenAI' : 'Deepseek'} models are allowed
          </p>
        </div>
        
        <div>
          <Label htmlFor="model-description">Description (optional)</Label>
          <Input 
            id="model-description"
            value={modelDescription}
            onChange={(e) => setModelDescription(e.target.value)}
            placeholder="Advanced model"
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
