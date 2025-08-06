/**
 * Utilidades para manejo de niveles de confianza y explicaciones
 * Centraliza la lógica de explicación de confianza para reutilización
 */

export interface ConfidenceExplanation {
  level: string;
  description: string;
  color: string;
  factors: string[];
}

/**
 * Obtiene explicación detallada del nivel de confianza
 * Patrón usado en predicciones y análisis de datos
 */
export const getConfidenceExplanation = (confidence: number): ConfidenceExplanation => {
  if (confidence >= 80) {
    return {
      level: 'Muy Alta',
      description: 'Predicción muy confiable basada en datos consistentes y patrones claros',
      color: 'text-green-400',
      factors: [
        'Datos abundantes y consistentes',
        'Progresión clara y estable',
        'Entrenamientos regulares recientes',
      ],
    };
  } else if (confidence >= 60) {
    return {
      level: 'Alta',
      description: 'Predicción confiable con datos suficientes para análisis preciso',
      color: 'text-blue-400',
      factors: [
        'Suficientes datos históricos',
        'Patrones de progreso identificables',
        'Regularidad en entrenamientos',
      ],
    };
  } else if (confidence >= 40) {
    return {
      level: 'Moderada',
      description: 'Predicción con incertidumbre moderada, usar como orientación general',
      color: 'text-yellow-400',
      factors: [
        'Datos limitados o irregulares',
        'Progresión variable o inconsistente',
        'Períodos largos sin entrenar',
      ],
    };
  } else if (confidence >= 20) {
    return {
      level: 'Baja',
      description: 'Predicción incierta, requiere más datos para mayor precisión',
      color: 'text-orange-400',
      factors: [
        'Pocos datos históricos',
        'Gran variabilidad en rendimiento',
        'Entrenamientos muy esporádicos',
      ],
    };
  } else {
    return {
      level: 'Muy Baja',
      description: 'Predicción no confiable, se necesitan más entrenamientos consistentes',
      color: 'text-red-400',
      factors: [
        'Datos insuficientes o de mala calidad',
        'Sin patrones identificables',
        'Falta de consistencia temporal',
      ],
    };
  }
};

/**
 * Obtiene el color del badge de confianza
 * Utilidad para componentes de UI
 */
export const getConfidenceBadgeColor = (confidence: number): string => {
  if (confidence >= 80) return 'bg-green-500/20 text-green-400 border-green-500/30';
  if (confidence >= 60) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
  if (confidence >= 40) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
  if (confidence >= 20) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
  return 'bg-red-500/20 text-red-400 border-red-500/30';
};

/**
 * Obtiene el icono de confianza
 * Utilidad para componentes de UI
 */
export const getConfidenceIcon = (confidence: number): string => {
  if (confidence >= 80) return '🎯';
  if (confidence >= 60) return '📊';
  if (confidence >= 40) return '⚠️';
  if (confidence >= 20) return '❓';
  return '❌';
};
