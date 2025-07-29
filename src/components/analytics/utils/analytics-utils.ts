import { Activity, BarChart3, Calendar, Target, TrendingDown, TrendingUp, Zap } from 'lucide-react';

/**
 * Obtiene el icono correspondiente a una métrica
 */
export const getMetricIcon = (metricId: string) => {
  switch (metricId) {
    case 'total-volume': return BarChart3;
    case 'total-workouts': return Calendar;
    case 'unique-exercises': return Target;
    case 'average-weight': return TrendingUp;
    case 'training-days': return Activity;
    case 'weekly-frequency': return Zap;
    default: return BarChart3;
  }
};

/**
 * Obtiene las clases de color para una métrica
 */
export const getMetricColor = (color: string) => {
  const colors = {
    blue: 'text-blue-400 bg-blue-600/20',
    green: 'text-green-400 bg-green-600/20',
    purple: 'text-purple-400 bg-purple-600/20',
    yellow: 'text-yellow-400 bg-yellow-600/20',
    indigo: 'text-indigo-400 bg-indigo-600/20',
    teal: 'text-teal-400 bg-teal-600/20',
  };
  return colors[color as keyof typeof colors] || colors.blue;
};

/**
 * Obtiene el icono de tendencia
 */
export const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up': return TrendingUp;
    case 'down': return TrendingDown;
    default: return Activity;
  }
};

/**
 * Obtiene las clases de color para una tendencia
 */
export const getTrendColor = (trend: string) => {
  switch (trend) {
    case 'up': return 'text-green-400';
    case 'down': return 'text-red-400';
    default: return 'text-gray-400';
  }
};
