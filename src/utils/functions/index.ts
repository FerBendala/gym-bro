/**
 * Utilidades genéricas del proyecto
 * Funciones reutilizables para validación, filtros, fechas, gráficos, estadísticas, estilos, notificaciones, tiempo, selects, stat-cards y tabs
 */

export * from './advanced-analysis';
export * from './calendar-utils';
export * from './category-analysis';
export * from './chart-utils';
export * from './date-filters';
export * from './filter-utils';
export * from './notification-utils';
export * from './select-utils';
export * from './stat-card-utils';
export * from './stats-utils';
export * from './style-utils';
export * from './tab-utils';
export * from './time-utils';
export * from './trends-analysis';
export * from './url-preview-utils';
export * from './url-validation';

// Tipos
export type { ChartDimensions, DataRange } from './chart-utils';

// Re-exportar funciones específicas de stats-utils para compatibilidad
export {
  calculateAverageStrengthIndex, calculateEstimated1RM,
  calculateStrengthIndex,
  calculateStrengthProgress
} from './stats-utils';

// Re-exportar funciones específicas de advanced-analysis para consistencia
export {
  getLastWeekRecords, getThisWeekRecords
} from './advanced-analysis';

// Re-exportar funciones avanzadas de análisis de fuerza
export {
  calculateAdvancedStrengthAnalysis,
  calculateEnhanced1RMPrediction
} from './stats-utils';

// Re-exportar tipos de análisis de fuerza
export type {
  AdvancedStrengthAnalysis,
  Enhanced1RMPrediction
} from './stats-utils';

// Re-exportar funciones específicas de category-analysis para consistencia
export {
  calculateIntensityScore
} from './category-analysis';

