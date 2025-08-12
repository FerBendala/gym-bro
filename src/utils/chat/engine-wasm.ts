import type { ChatMessage } from '@/stores/chat';
import { env, pipeline } from '@xenova/transformers';

export interface WasmEngine {
  generate: (messages: ChatMessage[]) => Promise<string>;
}

let text2text: any | null = null;

const buildPrompt = (messages: ChatMessage[]): string => {
  const history = messages
    .map((m) => `${m.role === 'user' ? 'Usuario' : m.role === 'assistant' ? 'Asistente' : 'Sistema'}: ${m.content}`)
    .join('\n');
  return `Eres un asistente de fitness y salud que responde en español de forma directa y clara. 
Usa el contexto proporcionado si existe y no inventes números.
Mantén la respuesta breve y accionable.\n\n${history}\nAsistente:`;
};

export const getWasmEngine = async (): Promise<WasmEngine> => {
  if (!text2text) {
    // Configurar caché del navegador y backend WASM
    env.useBrowserCache = true;
    env.allowRemoteModels = true;
    // Intentar ruta local primero (para uso 100% offline si existen modelos en /public/models)
    // Estructura esperada:
    // public/models/Qwen2.5-0.5B-Instruct/*
    // public/models/LaMini-Flan-T5-77M/*
    // Si no existen, Transformers.js descargará desde la red y cacheará.
    env.localModelPath = '/models';
    // Modelo conversacional multilenguaje. Intentar primero un modelo de diálogo pequeño.
    try {
      // Qwen2.5-0.5B-Instruct es conversacional y ligero
      try {
        text2text = await pipeline('text-generation', '/models/Qwen2.5-0.5B-Instruct');
      } catch {
        text2text = await pipeline('text-generation', 'Xenova/Qwen2.5-0.5B-Instruct');
      }
    } catch {
      // Fallback a LaMini-Flan T5 77M si el anterior falla
      try {
        text2text = await pipeline('text2text-generation', '/models/LaMini-Flan-T5-77M');
      } catch {
        text2text = await pipeline('text2text-generation', 'Xenova/LaMini-Flan-T5-77M');
      }
    }
  }

  return {
    async generate(messages: ChatMessage[]): Promise<string> {
      const prompt = buildPrompt(messages);
      const out = await text2text(prompt, { max_new_tokens: 200, temperature: 0.8, top_p: 0.95 });
      const text = Array.isArray(out)
        ? (out[0]?.generated_text ?? out[0]?.summary_text ?? '')
        : (out?.generated_text ?? out?.summary_text ?? '');
      return String(text).trim();
    },
  };
};


