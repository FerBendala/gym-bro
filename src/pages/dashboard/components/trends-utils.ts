import { Activity, Calendar, CheckCircle, TrendingUp, Zap } from 'lucide-react';
import React from 'react';

// Función de utilidad para manejar valores seguros
export const safeNumber = (value: number | undefined, fallback: number = 0): number => {
  return typeof value === 'number' && !isNaN(value) ? value : fallback;
};

// Iconos y colores para días de la semana (como en main)
export const dayIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'Lunes': Calendar,
  'Martes': Activity,
  'Miércoles': Zap,
  'Jueves': TrendingUp,
  'Viernes': CheckCircle,
  'Sábado': Calendar,
  'Domingo': Calendar
};

export const dayColors: Record<string, string> = {
  'Lunes': 'from-blue-500/80 to-cyan-500/80',
  'Martes': 'from-green-500/80 to-emerald-500/80',
  'Miércoles': 'from-purple-500/80 to-violet-500/80',
  'Jueves': 'from-orange-500/80 to-amber-500/80',
  'Viernes': 'from-red-500/80 to-pink-500/80',
  'Sábado': 'from-indigo-500/80 to-blue-500/80',
  'Domingo': 'from-teal-500/80 to-green-500/80'
};