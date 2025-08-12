import { detectIntent } from './intent-detect';
import { getUserContext } from './user-context';

export const fallbackAnswer = async (question: string): Promise<string> => {
  const ctx = await getUserContext();
  const intent = detectIntent(question);
  switch (intent) {
    case 'trend-overview':
    case 'normalized-volume-trend':
      return `Tendencia actual: ${ctx.predictionsText}. Si necesitas el desglose por semanas o categorías, te lo doy.`;
    case 'pr-prediction':
      return `Según tus datos, ${ctx.predictionsText}. Dime el ejercicio concreto para afinar la proyección.`;
    case 'category-volume':
      return `Puedo darte el volumen por categoría y la menos entrenada. Indica el rango (p. ej., últimas 4 semanas).`;
    case 'recommendations':
      return `Puedo recomendar cambios basados en tendencia y riesgo de meseta. ¿Quieres recomendaciones conservadoras o agresivas?`;
    case 'recent-workout':
      return `¿Quieres el último entreno por ejercicio o el último absoluto? Puedo listar ambos.`;
    case 'exercises-list':
      return `Puedo listar tus ejercicios y su categoría. ¿Quieres un resumen por categoría o todos por fecha?`;
    case 'projection-request':
      return `Dime el ejercicio (por ejemplo, banca) y el horizonte (2-4 semanas) y te propongo una progresión basada en tu tendencia.`;
    default:
      return `Tengo ${ctx.summary.workouts} entrenamientos y tus métricas calculadas. ${ctx.predictionsText}. ¿Quieres que hablemos de progreso, PR, volumen por categorías o recomendaciones?`;
  }
};


