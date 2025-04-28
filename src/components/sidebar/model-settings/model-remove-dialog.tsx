
import { useChat } from "@/contexts/chat-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ModelRemoveDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  modelId: string | null;
  onCancel: () => void;
}

export function ModelRemoveDialog({ isOpen, onOpenChange, modelId, onCancel }: ModelRemoveDialogProps) {
  const { removeModel } = useChat();

  const confirmRemoveModel = () => {
    if (modelId) {
      removeModel(modelId);
      onCancel();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Model</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove this model from the available models list?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={confirmRemoveModel}
            className="bg-destructive hover:bg-destructive/90"
          >
            Remove
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
