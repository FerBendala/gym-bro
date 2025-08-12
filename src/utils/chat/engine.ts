import type { ChatMessage } from '@/stores/chat';

// Singleton global para evitar cargas múltiples a través de chunks diferentes
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalAny: any = globalThis as any;
let webllmEngine: WebLLMEngine | null = globalAny.__webllmEngineSingleton ?? null;
let webllmEnginePromise: Promise<WebLLMEngine> | null = globalAny.__webllmEnginePromise ?? null;

export interface WebLLMEngine {
  generate: (messages: ChatMessage[]) => Promise<string>;
}

import { supportsWebGPU } from './supports-webgpu';

export const getEngine = async (): Promise<WebLLMEngine> => {
  if (webllmEngine) return webllmEngine;
  if (webllmEnginePromise) return webllmEnginePromise;

  if (!supportsWebGPU()) {
    throw new Error('WebGPU no disponible');
  }

  webllmEnginePromise = (async () => {
    const { CreateMLCEngine, prebuiltAppConfig } = await import('@mlc-ai/web-llm');

    // Modelo principal (configurable). Por defecto: Phi-3-mini-4k-instruct (mejor QA general ligera)
    const configured = (typeof localStorage !== 'undefined' && localStorage.getItem('chat.modelId')) || '';
    const modelId = configured || 'Phi-3-mini-4k-instruct-q4f16_1-MLC';

    const engine = await CreateMLCEngine(modelId, {
      appConfig: prebuiltAppConfig,
      logLevel: 'ERROR',
    });

    const wrapper: WebLLMEngine = {
      async generate(messages: ChatMessage[]) {
        const response = await engine.chat.completions.create({
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          stream: false,
        });
        const text = response.choices?.[0]?.message?.content ?? '';
        return text;
      },
    };

    webllmEngine = wrapper;
    globalAny.__webllmEngineSingleton = wrapper;
    return wrapper;
  })();

  globalAny.__webllmEnginePromise = webllmEnginePromise;
  return webllmEnginePromise;
};


