
import { useState } from "react";
import { useChat } from "@/contexts/chat-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { AIModels } from "@/types/chat";
import { useToast } from "@/hooks/use-toast";

interface AddModelFormProps {
  isAdmin: boolean;
}

export function AddModelForm({ isAdmin }: AddModelFormProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [newModel, setNewModel] = useState<Partial<AIModels>>({
    name: "",
    id: "",
    provider: "",
    description: ""
  });
  const { addModel } = useChat();
  const { toast } = useToast();

  const handleAddModel = () => {
    if (!newModel.name || !newModel.id || !newModel.provider) {
      toast({
        title: "Missing information",
        description: "Please fill out all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Create a complete model object
    const modelToAdd: AIModels = {
      id: newModel.id,
      name: newModel.name,
      provider: newModel.provider,
      description: newModel.description || undefined
    };

    addModel(modelToAdd);
    
    // Reset form
    setNewModel({
      name: "",
      id: "",
      provider: "",
      description: ""
    });
    
    // Close form
    setIsFormOpen(false);

    toast({
      title: "Model added",
      description: `${newModel.name} has been added to available models.`
    });
  };

  if (!isAdmin) return null;

  return (
    <div className="mt-4 border rounded-md p-3">
      {!isFormOpen ? (
        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2"
          onClick={() => setIsFormOpen(true)}
        >
          <Plus className="h-4 w-4" /> Add Custom Model
        </Button>
      ) : (
        <div className="space-y-3">
          <h3 className="text-md font-medium">Add Custom Model</h3>
          
          <div className="space-y-2">
            <Label htmlFor="model-name">Model Name*</Label>
            <Input 
              id="model-name"
              value={newModel.name}
              onChange={(e) => setNewModel({...newModel, name: e.target.value})}
              placeholder="Claude 3 Opus"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="model-id">Model ID*</Label>
            <Input 
              id="model-id"
              value={newModel.id}
              onChange={(e) => setNewModel({...newModel, id: e.target.value})}
              placeholder="anthropic/claude-3-opus"
            />
            <p className="text-xs text-muted-foreground">Format as provider/model-name</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="model-provider">Provider*</Label>
            <Input 
              id="model-provider"
              value={newModel.provider}
              onChange={(e) => setNewModel({...newModel, provider: e.target.value})}
              placeholder="Anthropic"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="model-description">Description (optional)</Label>
            <Textarea 
              id="model-description"
              value={newModel.description || ""}
              onChange={(e) => setNewModel({...newModel, description: e.target.value})}
              placeholder="Describe this model's capabilities"
              rows={2}
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button onClick={handleAddModel}>Add Model</Button>
          </div>
        </div>
      )}
    </div>
  );
}
