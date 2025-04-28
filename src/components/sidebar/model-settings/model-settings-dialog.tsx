
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ApiKeysTab } from "./tabs/api-keys-tab";
import { BaseUrlsTab } from "./tabs/base-urls-tab";
import { ModelsTab } from "./tabs/models-tab";
import { ModelRemoveDialog } from "./model-remove-dialog";

interface ModelSettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ModelSettingsDialog({ isOpen, onOpenChange }: ModelSettingsDialogProps) {
  const [configTab, setConfigTab] = useState("apikeys");
  const [modelToRemove, setModelToRemove] = useState<string | null>(null);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  
  const handleRemoveModel = (modelId: string) => {
    setModelToRemove(modelId);
    setIsRemoveDialogOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>AI Models Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Tabs defaultValue="apikeys" value={configTab} onValueChange={setConfigTab}>
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="apikeys">API Keys</TabsTrigger>
                <TabsTrigger value="baseurls">Base URLs</TabsTrigger>
                <TabsTrigger value="models">Available Models</TabsTrigger>
              </TabsList>
              
              <ApiKeysTab active={configTab === "apikeys"} />
              <BaseUrlsTab active={configTab === "baseurls"} />
              <ModelsTab active={configTab === "models"} onRemoveModel={handleRemoveModel} />
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <ModelRemoveDialog 
        isOpen={isRemoveDialogOpen}
        onOpenChange={setIsRemoveDialogOpen}
        modelId={modelToRemove}
        onCancel={() => setModelToRemove(null)}
      />
    </>
  );
}
