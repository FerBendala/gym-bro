/**
 * Utilidades genéricas del proyecto
 * Funciones reutilizables para validación, filtros, fechas, gráficos, estadísticas, estilos, notificaciones, tiempo, selects, stat-cards y tabs
 */

export { getAllAssignments } from '@/api/services';
export * from './advanced-analysis';
export * from './calendar-utils';
export * from './category-analysis';
export * from './chart-utils';
export * from './date-filters';
export * from './debug-shoulders';
export * from './export-utils';
export * from './filter-utils';
export * from './select-utils';
export * from './stat-card-utils';
export * from './stats-utils';
export * from './style-utils';
export * from './tab-utils';
export * from './time-utils';
export * from './toast-utils';
export * from './trends-analysis';
export * from './url-preview-utils';
export * from './url-validation';
export * from './workout-utils';

// 🎯 Exportaciones específicas para normalización semanal
export {
  calculateNormalizedVolumeTrend, getDayName, getWeeklyVolumeInsights,
  predictVolumeForDay
} from './workout-utils';

export {
  analyzeMuscleBalance,
  calculateBalanceScore,
  calculateCategoryMetrics,
  calculateIntensityScore,
  calculateRecentCategoryMetrics
} from './category-analysis';

