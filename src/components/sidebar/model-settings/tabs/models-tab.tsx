
import { useState, useEffect } from "react";
import { Trash2 } from "lucide-react";
import { useChat } from "@/contexts/chat-context";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useAdminCheck } from "@/hooks/use-admin-check";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { getProviderDisplayName } from "./api-keys-tab";
import { AddModelForm } from "../add-model-form";

interface ModelsTabProps {
  active: boolean;
  onRemoveModel: (modelId: string) => void;
}

export function ModelsTab({ active, onRemoveModel }: ModelsTabProps) {
  const { availableModels } = useChat();
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  
  // Use the admin check hook to determine if user is admin
  const { isAdmin } = useAdminCheck(user?.id);
  
  // Group models by provider
  const modelsByProvider = availableModels.reduce((acc, model) => {
    const provider = model.provider.toLowerCase();
    if (!acc[provider]) {
      acc[provider] = [];
    }
    acc[provider].push(model);
    return acc;
  }, {} as Record<string, typeof availableModels>);
  
  // Get unique provider names
  const providerNames = Object.keys(modelsByProvider);
  
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
  }, [navigate]);

  return (
    <TabsContent value="models">
      <div className="space-y-4">
        {providerNames.map((provider) => (
          <div key={provider} className="space-y-2">
            <h3 className="text-lg font-medium capitalize">{getProviderDisplayName(provider)}</h3>
            <ul className="space-y-2">
              {modelsByProvider[provider].map((model) => (
                <li key={model.id} className="p-2 bg-secondary/30 rounded-md flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium">{model.name}</div>
                    <div className="text-xs text-muted-foreground">{model.id}</div>
                    {model.description && (
                      <div className="text-sm mt-1">{model.description}</div>
                    )}
                  </div>
                  {isAdmin && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => onRemoveModel(model.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
        
        {/* Add the new component for adding models */}
        <AddModelForm isAdmin={isAdmin} />

        {!isAdmin && (
          <div className="text-center p-4 text-sm text-muted-foreground">
            Only administrators can manage models
          </div>
        )}
      </div>
    </TabsContent>
  );
}
