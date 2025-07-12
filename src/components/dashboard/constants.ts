import { Activity, Brain, History, Scale, Target, Zap } from 'lucide-react';
import type { DashboardTabConfig } from './types';

/**
 * Configuración de tabs para el Dashboard
 * Define las pestañas disponibles y sus metadatos
 */
export const DASHBOARD_TABS: DashboardTabConfig[] = [
  {
    id: 'balance',
    label: 'Balance Muscular',
    icon: Scale,
    description: 'Equilibrio, progreso y análisis detallado por grupos musculares'
  },
  {
    id: 'trends',
    label: 'Tendencias',
    icon: Activity,
    description: 'Patrones temporales y hábitos de entrenamiento'
  },
  {
    id: 'history',
    label: 'Historial',
    icon: History,
    description: 'Evolución temporal detallada de entrenamientos'
  },
  {
    id: 'exercises',
    label: 'Análisis de Ejercicios',
    icon: Target,
    description: 'Análisis profundo de rendimiento por ejercicio'
  },
  {
    id: 'advanced',
    label: 'Análisis Avanzado',
    icon: Zap,
    description: 'Métricas complejas y comparaciones detalladas'
  },
  {
    id: 'predictions',
    label: 'Predicciones',
    icon: Brain,
    description: 'Análisis predictivo e inteligencia artificial'
  }
];

/**
 * Tab por defecto del dashboard
 * Cambiado a 'balance' después de eliminar 'categories'
 */
export const DEFAULT_DASHBOARD_TAB = 'balance' as const; 