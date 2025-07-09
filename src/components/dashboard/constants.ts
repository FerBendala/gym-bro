import { Activity, Target, Zap } from 'lucide-react';
import type { DashboardTabConfig } from './types';

/**
 * Configuración de tabs para el Dashboard
 * Define las pestañas disponibles y sus metadatos
 */
export const DASHBOARD_TABS: DashboardTabConfig[] = [
  {
    id: 'categories',
    label: 'Por Categoría',
    icon: Target,
    description: 'Análisis por grupos musculares y balance'
  },
  {
    id: 'trends',
    label: 'Tendencias',
    icon: Activity,
    description: 'Patrones temporales y hábitos de entrenamiento'
  },
  {
    id: 'advanced',
    label: 'Análisis Avanzado',
    icon: Zap,
    description: 'Métricas complejas y comparaciones detalladas'
  }
];

/**
 * Tab por defecto al abrir el dashboard
 */
export const DEFAULT_DASHBOARD_TAB: DashboardTabConfig['id'] = 'categories'; 