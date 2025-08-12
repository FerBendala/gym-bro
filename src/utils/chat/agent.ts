import type { ChatMessage } from '@/stores/chat';
import { getEngine } from './engine';
import { detectIntent } from './intent-detect';
import { supportsWebGPU } from './supports-webgpu';
import { tools } from './tools';

export const agentAnswer = async (history: ChatMessage[], userText: string): Promise<string> => {
  const intent = detectIntent(userText);
  // En intents de datos, primero intentamos herramientas
  if (intent === 'category-volume-range') {
    const res = await tools.categoryVolume({ query: userText });
    if (res.ok) return res.content;
  }
  if (intent === 'projection-request' || intent === 'projection-exercise') {
    const res = await tools.exerciseProjection({ query: userText });
    if (res.ok) return res.content;
  }

  // Si no hay herramienta aplicable o falló, usar LLM con contexto si aplica.
  // Sin WASM: si no hay WebGPU, respondo modo “sin modelo”.
  const systemPrompt = [
    'Eres un asistente de fitness para Follow Gym. Responde SIEMPRE en español.',
    'No inventes números. Usa datos de herramientas si están disponibles.',
  ].join('\n');
  const generateWithWebLLM = async () => {
    const engine = await getEngine();
    return engine.generate([
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: userText },
    ]);
  };
  // Eliminado WASM por petición del usuario

  try {
    if (!supportsWebGPU()) {
      return 'Modo sin modelo (WebGPU no disponible). Puedo responder con tus datos (proyecciones, volúmenes, tendencias) si me los pides.';
    }
    // Timeout de seguridad para no “quedarse pensando” indefinidamente
    const timeoutMs = 8000;
    const timeout = new Promise<string>((_, rej) => setTimeout(() => rej(new Error('timeout')), timeoutMs));
    const answer = await Promise.race([generateWithWebLLM(), timeout]) as string;
    return answer;
  } catch {
    // Sin WASM: devuelve mensaje informativo
    return 'No se pudo generar con el modelo. Puedo darte respuestas basadas en tus datos: prueba "proyección de [ejercicio] 2 semanas" o "volumen en [categoría] últimas 4 semanas".';
  }
};


