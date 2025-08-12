export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export type ChatStatus = 'idle' | 'loading' | 'thinking' | 'sending' | 'ready' | 'fallback';

export interface ChatState {
  messages: ChatMessage[];
  status: ChatStatus;
  lastCategory?: string;
  lastRange?: { start: string; end: string; label: string };
}

export interface ChatActions {
  addMessage: (message: ChatMessage) => Promise<void>;
  setStatus: (status: ChatStatus) => void;
  reset: () => void;
}

export type ChatStore = ChatState & ChatActions;


