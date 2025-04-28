
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceAssistantProps {
  onTranscript: (text: string) => void;
  isLoading?: boolean;
}

export function VoiceAssistant({ onTranscript, isLoading }: VoiceAssistantProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];

      mediaRecorder.addEventListener("dataavailable", (event) => {
        audioChunks.push(event.data);
      });

      mediaRecorder.addEventListener("stop", async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        const reader = new FileReader();
        
        reader.onload = async () => {
          if (reader.result) {
            // Convert to base64 and remove prefix
            const base64Audio = (reader.result as string).split(',')[1];
            
            toast({
              title: "Processing audio...",
              description: "Converting your speech to text",
            });
            
            try {
              // In a production app, this would call a Supabase Edge Function
              // For demo purposes, we're simulating a successful response
              setTimeout(() => {
                onTranscript("How can Sparky AI help me today?");
                toast({
                  title: "Audio transcribed",
                  description: "Your speech has been converted to text",
                });
              }, 1500);
              
              // Cleanup the media stream
              stream.getTracks().forEach((track) => track.stop());
            } catch (error) {
              console.error("Error transcribing audio:", error);
              toast({
                title: "Error",
                description: "Failed to transcribe audio",
                variant: "destructive",
              });
            }
          }
        };
        
        reader.readAsDataURL(audioBlob);
      });

      mediaRecorder.start();
      setRecorder(mediaRecorder);
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone",
      });
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to use this feature",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (recorder && isRecording) {
      recorder.stop();
      setIsRecording(false);
    }
  };

  return (
    <Button
      onClick={isRecording ? stopRecording : startRecording}
      disabled={isLoading}
      size="icon"
      variant={isRecording ? "destructive" : "ghost"}
      className="h-8 w-8 shrink-0"
      title={isRecording ? "Stop recording" : "Start voice input"}
    >
      {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </Button>
  );
}
