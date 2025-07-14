import { Activity, Dumbbell, Footprints, Hexagon, RotateCcw, Shield, Triangle } from 'lucide-react';

/**
 * Categorías disponibles para ejercicios
 */
export const EXERCISE_CATEGORIES = [
  'Pecho',
  'Espalda',
  'Piernas',
  'Hombros',
  'Brazos',
  'Core'
] as const;

export type ExerciseCategory = typeof EXERCISE_CATEGORIES[number];

/**
 * Iconos específicos para cada categoría muscular
 * Centralizados para mantener consistencia en toda la aplicación
 */
export const CATEGORY_ICONS: Record<string, React.FC<any>> = {
  'Pecho': Hexagon,        // Hexágono representa la forma de los pectorales
  'Espalda': Shield,       // Escudo representa la protección/soporte de la espalda
  'Piernas': Footprints,   // Huellas representan el movimiento de piernas
  'Hombros': Triangle,     // Triángulo representa la forma de los deltoides
  'Brazos': Dumbbell,      // Mancuerna es el icono más representativo para brazos
  'Core': RotateCcw,       // Rotación representa los movimientos de core/abdominales
  'Sin categoría': Activity // Icono genérico para ejercicios sin categoría
};

/**
 * Colores de gradiente para cada categoría muscular
 * Centralizados para mantener consistencia en toda la aplicación
 */
export const CATEGORY_COLORS: Record<string, string> = {
  'Pecho': 'from-red-500/80 to-pink-500/80',
  'Espalda': 'from-blue-500/80 to-cyan-500/80',
  'Piernas': 'from-green-500/80 to-emerald-500/80',
  'Hombros': 'from-purple-500/80 to-violet-500/80',
  'Brazos': 'from-orange-500/80 to-amber-500/80',
  'Core': 'from-indigo-500/80 to-blue-500/80',
  'Sin categoría': 'from-gray-500/80 to-gray-600/80'
};

/**
 * Utilidad para obtener el icono de una categoría
 */
export const getCategoryIcon = (category: string): React.FC<any> => {
  return CATEGORY_ICONS[category] || Activity;
};

/**
 * Utilidad para obtener el color de gradiente de una categoría
 */
export const getCategoryColor = (category: string): string => {
  return CATEGORY_COLORS[category] || 'from-gray-500/80 to-gray-600/80';
};

/**
 * Utilidad para crear un tag de categoría con diseño consistente
 */
export const createCategoryTag = (category: string, size: 'sm' | 'md' = 'sm') => {
  const Icon = getCategoryIcon(category);
  const colorGradient = getCategoryColor(category);

  const sizeClasses = {
    sm: {
      container: 'text-xs px-2 py-1',
      icon: 'w-3 h-3'
    },
    md: {
      container: 'text-sm px-3 py-1.5',
      icon: 'w-4 h-4'
    }
  };

  return {
    Icon,
    colorGradient,
    containerClasses: `inline-flex items-center space-x-1 ${sizeClasses[size].container} text-white bg-gradient-to-r ${colorGradient} rounded-full font-medium shadow-sm border border-white/20`,
    iconClasses: sizeClasses[size].icon
  };
};

/**
 * Distribución ideal de volumen por categoría muscular (porcentajes recomendados)
 * Basada en principios de anatomía funcional, prevención de lesiones y desarrollo equilibrado
 */
export const IDEAL_VOLUME_DISTRIBUTION: Record<string, number> = {
  'Pecho': 20,        // Aumentado por redistribución
  'Espalda': 25,      // Aumentado por balance postural y redistribución  
  'Piernas': 30,      // Reducido ligeramente por redistribución
  'Hombros': 10,      // Mantenido
  'Brazos': 10,        // Reducido ligeramente
  'Core': 5          // Reducido ligeramente
};

/**
 * Obtiene el porcentaje ideal de volumen para una categoría específica
 */
export const getIdealVolumePercentage = (categoryName: string): number => {
  return IDEAL_VOLUME_DISTRIBUTION[categoryName] || 15; // 15% por defecto para categorías no definidas
};

/**
 * Pesos relativos para el esfuerzo muscular en ejercicios multi-categoría
 * Representa qué porcentaje del esfuerzo total recibe cada categoría muscular
 */
export const CATEGORY_EFFORT_WEIGHTS: Record<string, Record<string, number>> = {
  // Ejercicios comunes de pecho + hombros
  'Pecho-Hombros': {
    'Pecho': 0.7,
    'Hombros': 0.3
  },
  // Ejercicios comunes de espalda + brazos
  'Espalda-Brazos': {
    'Espalda': 0.7,
    'Brazos': 0.3
  },
  // Ejercicios comunes de piernas + core
  'Piernas-Core': {
    'Piernas': 0.8,
    'Core': 0.2
  },
  // Ejercicios comunes de hombros + brazos
  'Hombros-Brazos': {
    'Hombros': 0.6,
    'Brazos': 0.4
  },
  // Ejercicios comunes de pecho + brazos
  'Pecho-Brazos': {
    'Pecho': 0.6,
    'Brazos': 0.4
  },
  // Ejercicios comunes de espalda + hombros
  'Espalda-Hombros': {
    'Espalda': 0.7,
    'Hombros': 0.3
  }
};

/**
 * Calcula el esfuerzo relativo de cada categoría muscular en un ejercicio multi-categoría
 * Opción 2: Volumen Relativo al Esfuerzo
 */
export const calculateCategoryEffortDistribution = (categories: string[]): Record<string, number> => {
  if (categories.length === 0) return {};
  if (categories.length === 1) return { [categories[0]]: 1.0 };

  // Crear clave para buscar en los pesos predefinidos
  const categoryKey = categories.sort().join('-');

  // Buscar en los pesos predefinidos
  if (CATEGORY_EFFORT_WEIGHTS[categoryKey]) {
    return CATEGORY_EFFORT_WEIGHTS[categoryKey];
  }

  // Si no existe una combinación específica, usar distribución por defecto
  const defaultDistribution: Record<string, number> = {};

  // Pesos por defecto basados en la importancia típica del grupo muscular
  const defaultWeights: Record<string, number> = {
    'Pecho': 0.8,
    'Espalda': 0.8,
    'Piernas': 0.9,
    'Hombros': 0.6,
    'Brazos': 0.5,
    'Core': 0.4
  };

  // Calcular peso total
  const totalWeight = categories.reduce((sum, category) => {
    return sum + (defaultWeights[category] || 0.5);
  }, 0);

  // Distribuir proporcionalmente
  categories.forEach(category => {
    const weight = defaultWeights[category] || 0.5;
    defaultDistribution[category] = weight / totalWeight;
  });

  return defaultDistribution;
}; 