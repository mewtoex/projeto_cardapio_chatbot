export interface BotMessage {
  id: string;
  command: string;
  response_text: string;
  is_active: boolean;
  last_updated?: string;
}

export interface BotMessageFormData {
  command: string;
  response_text: string;
  is_active: boolean;
}