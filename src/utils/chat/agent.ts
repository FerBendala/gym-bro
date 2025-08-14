import type { ChatMessage } from '@/stores/chat';
import { getEngine } from './engine';
import { detectIntent } from './intent-detect';
import { supportsWebGPU } from './supports-webgpu';
import { tools } from './tools';

export const agentAnswer = async (history: ChatMessage[], userText: string): Promise<string> => {
  const intent = detectIntent(userText);
  console.log('🔍 Intent detectado:', intent, 'para:', userText);
  
  // 1. QUERIES ESPECÍFICAS POR PATRÓN - Prioridad ABSOLUTA
  // Ejercicios de un día específico (debe ir ANTES que historyRange)
  if (/ayer|hoy|mañana|manana/i.test(userText) && /ejercici/i.test(userText)) {
    console.log('📅 Ejecutando dayExercises...');
    const res = await (tools as any).dayExercises({ query: userText });
    console.log('📅 Resultado dayExercises:', res);
    if (res?.ok) return res.content;
  }

  // Peso máximo de un ejercicio específico
  if (/cu[aá]nt[oa]\s+(peso\s+)?levanto/i.test(userText) || /m[aá]ximo/i.test(userText)) {
    console.log('🏋️ Ejecutando exerciseMaxWeight...');
    const res = await (tools as any).exerciseMaxWeight({ query: userText });
    console.log('🏋️ Resultado exerciseMaxWeight:', res);
    if (res?.ok) return res.content;
  }

  // Volumen de ejercicio específico (no categoría)
  if (/^volumen\s+de\s+/i.test(userText) || /volumen\s+[^de]/i.test(userText)) {
    console.log('📊 Ejecutando exerciseVolume...');
    // Primero intentar como ejercicio específico
    const exRes = await (tools as any).exerciseVolume({ query: userText + ' últimas 4 semanas' });
    console.log('📊 Resultado exerciseVolume:', exRes);
    if (exRes?.ok) return exRes.content;
    
    // Si falla, intentar como categoría
    const catRes = await tools.categoryVolume({ query: userText + ' últimas 4 semanas' });
    if (catRes.ok) return catRes.content;
  }

  // 2. INTENTS ESPECÍFICOS - Prioridad alta
  if (intent === 'projection-request' || intent === 'projection-exercise') {
    const res = await tools.exerciseProjection({ query: userText });
    if (res.ok) return res.content;
  }

  // 3. INTENTS DE CATEGORÍA - Prioridad media
  if (intent === 'category-volume-range') {
    let res = await tools.categoryVolume({ query: userText });
    if (!res.ok) {
      res = await tools.categoryVolume({ query: userText + ' últimas 4 semanas' });
    }
    if (res.ok) return res.content;
  }

  // 4. QUERIES GENÉRICAS - Prioridad baja (solo si NO hay queries específicas)
  // Solo ejecutar si NO contiene patrones específicos
  if (!/ayer|hoy|mañana|manana|cu[aá]nt[oa]\s+(peso\s+)?levanto|m[aá]ximo|^volumen\s+de\s+|volumen\s+[^de]/i.test(userText)) {
    if (/centralizad|tendencia|pr|meseta|confianza|fuerza/i.test(userText)) {
      const res = await tools.centralizedMetrics();
      if (res.ok) return res.content;
    }

    if (/historial|últim|ultima|rango/i.test(userText)) {
      const res = await tools.historyRange({ query: userText });
      if (res.ok) return res.content;
    }

    if (/asignacion|asignación|plan|semana/i.test(userText)) {
      const res = await tools.assignments();
      if (res.ok) return res.content;
    }
  }

  // 5. AUTO-REFORMULACIÓN Y LLM
  const ask = async (question: string) => {
    const { centralizedMetrics, historyRange, assignments, exerciseProjection, categoryVolume } = tools;
    if (/centralizad|tendencia|pr|meseta|confianza|fuerza|volumen/i.test(question)) {
      const res = await centralizedMetrics();
      if (res.ok) return res.content;
    }
    if (/historial|últim|ultima|rango/i.test(question)) {
      const res = await historyRange({ query: question });
      if (res.ok) return res.content;
    }
    if (/asignacion|asignación|plan|semana/i.test(question)) {
      const res = await assignments();
      if (res.ok) return res.content;
    }
    if (/proyecc|plan|programa/i.test(question)) {
      const res = await exerciseProjection({ query: question });
      if (res.ok) return res.content;
    }
    if (/volumen/i.test(question)) {
      const res = await categoryVolume({ query: question });
      if (res.ok) return res.content;
    }
    return '';
  };

  // Si no hay herramienta aplicable o falló, intentar auto-reformulación antes del LLM
  const reformulated = await ask(userText + ' últimas 4 semanas');
  if (reformulated) return reformulated;

  // Sin WASM: si no hay WebGPU, respondo modo "sin modelo".
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


