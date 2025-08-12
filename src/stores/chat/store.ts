import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { getUserContext } from '@/utils/chat/user-context';
import { ChatMessage, ChatStatus, ChatStore } from './types';

export const useChatStore = create<ChatStore>()(
  devtools(
    persist(
      (set, get) => ({
        messages: [],
        status: 'idle',

        setStatus: (status: ChatStatus) => set({ status }),

        reset: () => set({ messages: [] }),

        addMessage: async (message: ChatMessage) => {
          // Añadir mensaje del usuario
          set((state) => ({ messages: [...state.messages, message] }));

          try {
            // No volver a cargar el motor aquí; solo cambiar a 'thinking'
            set({ status: 'thinking' });
            await getUserContext();

            const { agentAnswer } = await import('@/utils/chat/agent');
            const answer = await agentAnswer(get().messages, message.content);

            set((state) => ({ messages: [...state.messages, { role: 'assistant', content: answer }] }));
            set({ status: 'ready' });
          } catch (e) {
            const fallback = 'No he podido responder ahora mismo.';
            set((state) => ({ messages: [...state.messages, { role: 'assistant', content: fallback }] }));
            set({ status: 'ready' });
          }
        },
      }),
      {
        name: 'chat-store',
        partialize: (state) => ({ messages: state.messages }),
      },
    ),
    { name: 'chat-store' },
  ),
);


