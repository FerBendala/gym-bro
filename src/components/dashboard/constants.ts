import { Activity, Brain, Scale, Zap } from 'lucide-react';
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
    description: 'Análisis completo de balance, progresión y métricas por grupo muscular'
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
  },
  {
    id: 'predictions',
    label: 'Predicciones',
    icon: Brain,
    description: 'Análisis predictivo e inteligencia artificial'
  }
];

/**
 * Tab por defecto al abrir el Dashboard
 */
export const DEFAULT_DASHBOARD_TAB: DashboardTabConfig['id'] = 'balance'; 