import React, { useEffect, useRef, useState } from 'react';
import { MessageBubble } from './components/message-bubble';

import { Page } from '@/components/layout';
import { useChatStore } from '@/stores/chat';

export const ChatAssistant: React.FC = () => {
  const { messages, addMessage, status, setStatus } = useChatStore();
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleSend = async () => {
    const content = input.trim();
    if (!content) return;
    setInput('');
    await addMessage({ role: 'user', content });
  };

  useEffect(() => {
    inputRef.current?.focus();
    // Precalentar motor y establecer estado
    let mounted = true;
    const warmup = async () => {
      if (status !== 'idle') return;
      try {
        setStatus('loading');
        const engine = await import('@/utils/chat/engine').then(m => m.getEngine());
        if (!mounted) return;
        // Pequeña prueba para confirmar disponibilidad
        await engine.generate([{ role: 'system', content: 'ok' }]);
        setStatus('ready');
      } catch {
        if (!mounted) return;
        setStatus('fallback');
      }
    };
    warmup();
    return () => { mounted = false; };
  }, []);

  return (
    <Page title="Chat IA" subtitle={status === 'ready' ? 'Listo' : status === 'loading' ? 'Cargando modelo…' : status === 'fallback' ? 'Modo ligero' : 'Preparado'}>
      <div className="flex flex-col h-[calc(100dvh-400px)] gap-3">
        <div className="flex-1 overflow-auto rounded-xl border border-gray-700 p-3 space-y-3">
          {messages.map((m, i) => (
            <MessageBubble key={i} role={m.role} content={m.content} />
          ))}
        </div>
        <div className="flex gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 outline-none"
            placeholder="Escribe tu pregunta…"
          />
          <button onClick={handleSend} className="px-4 py-2 rounded-xl bg-blue-600 text-white disabled:opacity-50" disabled={status === 'loading' && messages.length === 0}>
            Enviar
          </button>
        </div>
      </div>
    </Page>
  );
};


