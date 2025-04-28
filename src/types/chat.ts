
export type MessageRole = "user" | "assistant" | "system";

export interface Message {
  id: string;
  chat_id?: string;
  role: MessageRole;
  content: string;
  created_at: string;
  has_images?: boolean;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
  user_id?: string;
}

export interface OpenRouterMessage {
  role: MessageRole;
  content: string | {
    type: string;
    text?: string;
    image_url?: {
      url: string;
    };
  }[];
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface OpenRouterResponse {
  id: string;
  choices: {
    message: {
      role: MessageRole;
      content: string;
    };
    finish_reason: string;
  }[];
}

export interface AIModels {
  id: string;
  name: string;
  provider: string;
  description?: string;
}

export const defaultModels: AIModels[] = [
  {
    id: "anthropic/claude-3-opus",
    name: "Claude 3 Opus",
    provider: "Anthropic",
    description: "Most powerful model for complex tasks"
  },
  {
    id: "anthropic/claude-3-sonnet",
    name: "Claude 3 Sonnet",
    provider: "Anthropic",
    description: "Excellent balance of intelligence and speed"
  },
  {
    id: "anthropic/claude-3-haiku",
    name: "Claude 3 Haiku",
    provider: "Anthropic",
    description: "Fast and affordable"
  },
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    description: "Latest multimodal model"
  },
  {
    id: "google/gemini-1.5-pro",
    name: "Gemini 1.5 Pro",
    provider: "Google",
    description: "Multimodal model with long context"
  },
  {
    id: "meta-llama/llama-3-70b-instruct",
    name: "Llama 3 70B",
    provider: "Meta",
    description: "Open model with strong capabilities"
  },
];
