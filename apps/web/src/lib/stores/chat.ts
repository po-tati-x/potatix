import { create } from 'zustand';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatState {
  // Messages by lesson ID
  messages: Record<string, ChatMessage[]>;
  
  // Loading state by lesson ID
  loading: Record<string, boolean>;
  
  // Actions
  addMessage: (lessonId: string, message: ChatMessage) => void;
  setMessages: (lessonId: string, messages: ChatMessage[]) => void;
  clearMessages: (lessonId: string) => void;
  setLoading: (lessonId: string, loading: boolean) => void;
}

export const useChatStore = create<ChatState>()((set) => ({
  messages: {},
  loading: {},
  
  addMessage: (lessonId, message) => 
    set((state) => {
      const currentMessages = state.messages[lessonId] || [];
      return {
        messages: {
          ...state.messages,
          [lessonId]: [...currentMessages, message]
        }
      };
    }),
  
  setMessages: (lessonId, messages) => 
    set((state) => ({
      messages: {
        ...state.messages,
        [lessonId]: messages
      }
    })),
  
  clearMessages: (lessonId) => 
    set((state) => ({
      messages: {
        ...state.messages,
        [lessonId]: []
      }
    })),
  
  setLoading: (lessonId, loading) => 
    set((state) => ({
      loading: {
        ...state.loading,
        [lessonId]: loading
      }
    })),
}));

// Simple hooks for common operations
export const useMessages = (lessonId: string) => 
  useChatStore((state) => state.messages[lessonId] || []);

export const useLoading = (lessonId: string) => 
  useChatStore((state) => state.loading[lessonId] || false); 