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
  'Brazos': 10,       // Reducido ligeramente
  'Core': 5           // Reducido ligeramente
};

/**
 * Obtiene el porcentaje ideal de volumen para una categoría específica
 */

/**
 * Base de datos de ejercicios conocidos con distribuciones realistas de esfuerzo
 * Basada en análisis biomecánico y patrones de activación muscular
 */
export const KNOWN_EXERCISE_DISTRIBUTIONS: Record<string, Record<string, number>> = {
  // === PIERNAS ===
  'Press de pierna': { 'Piernas': 1.0 },
  'Press de piernas': { 'Piernas': 1.0 },
  'Sentadilla búlgara con mancuernas': { 'Piernas': 0.85, 'Core': 0.15 },
  'Extensiones de cuádriceps en máquina': { 'Piernas': 1.0 },
  'Hip Thrust': { 'Piernas': 0.9, 'Core': 0.1 },
  'Elevación de talones en prensa': { 'Piernas': 1.0 },
  'Curl femoral en máquina': { 'Piernas': 1.0 },
  'Zancadas caminando con pesas': { 'Piernas': 0.9, 'Core': 0.1 },

  // === PECHO ===
  'Press banca inclinado con mancuernas': { 'Pecho': 0.7, 'Hombros': 0.2, 'Brazos': 0.1 },
  'Press en banca con mancuernas': { 'Pecho': 0.7, 'Hombros': 0.2, 'Brazos': 0.1 },
  'Fondos en paralelas': { 'Pecho': 0.6, 'Brazos': 0.3, 'Hombros': 0.1 },
  'Cruces en polea alta': { 'Pecho': 0.9, 'Hombros': 0.1 },
  'Pullover con máquina': { 'Pecho': 0.6, 'Espalda': 0.4 },

  // === ESPALDA ===
  'Dominadas': { 'Espalda': 0.7, 'Brazos': 0.3 },
  'Remo en banco con apoyo': { 'Espalda': 0.8, 'Brazos': 0.2 },
  'Remo con mancuerna unilateral': { 'Espalda': 0.8, 'Brazos': 0.2 },
  'Remo inclinado en banco con mancuernas (agarre prono)': { 'Espalda': 0.8, 'Brazos': 0.2 },

  // === HOMBROS ===
  'Press militar con barra o mancuerna': { 'Hombros': 0.7, 'Brazos': 0.2, 'Core': 0.1 },
  'Elevaciones laterales estrictas': { 'Hombros': 1.0 },
  'Pájaros en máquina': { 'Hombros': 0.8, 'Espalda': 0.2 },
  'Elevaciones frontales con polea unilateral': { 'Hombros': 1.0 },
  'Aperturas invertidas en máquina': { 'Hombros': 0.8, 'Espalda': 0.2 },

  // === BRAZOS ===
  'Extensión de tríceps en cuerda': { 'Brazos': 1.0 },
  'Curl bíceps alterno en banco inclinado': { 'Brazos': 1.0 },

  // === CORE ===
  'Plancha abdominal': { 'Core': 1.0 },
  'Elevaciones de piernas colgado': { 'Core': 0.8, 'Brazos': 0.2 },
  'Rueda abdominal de rodillas': { 'Core': 0.9, 'Brazos': 0.1 }
};

/**
 * Patrones de ejercicios para detectar distribuciones inteligentes por palabras clave
 */
const EXERCISE_PATTERNS: Array<{
  patterns: string[];
  distribution: Record<string, number>;
  description: string;
}> = [
    // PIERNAS
    {
      patterns: ['press.*pierna', 'leg.*press', 'sentadilla', 'squat'],
      distribution: { 'Piernas': 0.9, 'Core': 0.1 },
      description: 'Ejercicio principal de piernas'
    },
    {
      patterns: ['extensión.*cuádriceps', 'extensiones.*cuádriceps', 'quad.*extension'],
      distribution: { 'Piernas': 1.0 },
      description: 'Aislamiento de cuádriceps'
    },
    {
      patterns: ['curl.*femoral', 'hamstring.*curl'],
      distribution: { 'Piernas': 1.0 },
      description: 'Aislamiento de isquiotibiales'
    },
    {
      patterns: ['talones', 'pantorrill', 'calf.*raise'],
      distribution: { 'Piernas': 1.0 },
      description: 'Entrenamiento de pantorrillas'
    },

    // PECHO
    {
      patterns: ['press.*banca', 'bench.*press', 'press.*banco'],
      distribution: { 'Pecho': 0.7, 'Hombros': 0.2, 'Brazos': 0.1 },
      description: 'Press de pecho básico'
    },
    {
      patterns: ['fondos', 'dips'],
      distribution: { 'Pecho': 0.6, 'Brazos': 0.3, 'Hombros': 0.1 },
      description: 'Fondos en paralelas'
    },
    {
      patterns: ['cruces', 'flies', 'aperturas.*pecho'],
      distribution: { 'Pecho': 0.9, 'Hombros': 0.1 },
      description: 'Ejercicio de aislamiento de pecho'
    },

    // ESPALDA
    {
      patterns: ['dominadas', 'pull.*up', 'chin.*up'],
      distribution: { 'Espalda': 0.7, 'Brazos': 0.3 },
      description: 'Dominadas y variaciones'
    },
    {
      patterns: ['remo', 'row'],
      distribution: { 'Espalda': 0.8, 'Brazos': 0.2 },
      description: 'Ejercicios de remo'
    },
    {
      patterns: ['pullover'],
      distribution: { 'Pecho': 0.6, 'Espalda': 0.4 },
      description: 'Pullover (híbrido pecho-espalda)'
    },

    // HOMBROS
    {
      patterns: ['press.*militar', 'overhead.*press', 'press.*hombro'],
      distribution: { 'Hombros': 0.7, 'Brazos': 0.2, 'Core': 0.1 },
      description: 'Press militar y variaciones'
    },
    {
      patterns: ['elevaciones.*laterales', 'lateral.*raise'],
      distribution: { 'Hombros': 1.0 },
      description: 'Elevaciones laterales'
    },
    {
      patterns: ['elevaciones.*frontales', 'front.*raise'],
      distribution: { 'Hombros': 1.0 },
      description: 'Elevaciones frontales'
    },
    {
      patterns: ['pájaros', 'rear.*delt', 'aperturas.*invert'],
      distribution: { 'Hombros': 0.8, 'Espalda': 0.2 },
      description: 'Deltoides posterior'
    },

    // BRAZOS
    {
      patterns: ['curl.*bíceps', 'bicep.*curl'],
      distribution: { 'Brazos': 1.0 },
      description: 'Ejercicios de bíceps'
    },
    {
      patterns: ['extensión.*tríceps', 'tricep.*extension'],
      distribution: { 'Brazos': 1.0 },
      description: 'Ejercicios de tríceps'
    },

    // CORE
    {
      patterns: ['plancha', 'plank'],
      distribution: { 'Core': 1.0 },
      description: 'Plancha abdominal'
    },
    {
      patterns: ['abdominal', 'crunch', 'sit.*up'],
      distribution: { 'Core': 1.0 },
      description: 'Ejercicios abdominales'
    },
    {
      patterns: ['rueda.*abdominal', 'ab.*wheel'],
      distribution: { 'Core': 0.9, 'Brazos': 0.1 },
      description: 'Rueda abdominal'
    }
  ];
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
 * Detecta patrones en el nombre de un ejercicio usando expresiones regulares
 */
const detectExercisePattern = (exerciseName: string): Record<string, number> | null => {
  const normalizedName = exerciseName.toLowerCase();

  for (const pattern of EXERCISE_PATTERNS) {
    for (const regex of pattern.patterns) {
      if (new RegExp(regex, 'i').test(normalizedName)) {
        return pattern.distribution;
      }
    }
  }

  return null;
};

/**
 * Distribución conservadora: categoría principal 70%, resto dividido
 * Más realista que la distribución equitativa anterior
 */
function getConservativeDistribution(categories: string[]): Record<string, number> {
  if (categories.length === 1) {
    return { [categories[0]]: 1.0 };
  }

  const distribution: Record<string, number> = {};
  const primaryCategory = categories[0]; // Asumir que la primera es la principal
  const secondaryCategories = categories.slice(1);

  // Categoría principal: 70%
  distribution[primaryCategory] = 0.7;

  // Categorías secundarias: dividir el 30% restante
  const effortPerSecondary = 0.3 / secondaryCategories.length;
  secondaryCategories.forEach(category => {
    distribution[category] = effortPerSecondary;
  });

  return distribution;
}

/**
 * Calcula la distribución de esfuerzo entre categorías musculares para un ejercicio
 * MEJORADO: Ahora usa distribuciones realistas basadas en biomecánica
 * 
 * Prioridad:
 * 1. Ejercicio conocido en base de datos → Distribución exacta
 * 2. Patrón detectado por nombre → Distribución inteligente  
 * 3. Fallback → Distribución conservadora (categoría principal 70%, resto dividido)
 */
export const calculateCategoryEffortDistribution = (
  categories: string[],
  exerciseName?: string
): Record<string, number> => {
  // Casos básicos
  if (categories.length === 0) return {};
  if (categories.length === 1) return { [categories[0]]: 1.0 };

  // Si no hay nombre del ejercicio, usar distribución conservadora
  if (!exerciseName) {
    return getConservativeDistribution(categories);
  }

  // 1. PRIORIDAD ALTA: Buscar en base de datos de ejercicios conocidos
  const knownDistribution = KNOWN_EXERCISE_DISTRIBUTIONS[exerciseName];
  if (knownDistribution) {
    // Verificar que las categorías coincidan y normalizar si es necesario
    const normalizedDistribution: Record<string, number> = {};
    let totalEffort = 0;

    categories.forEach(category => {
      const effort = knownDistribution[category] || 0;
      normalizedDistribution[category] = effort;
      totalEffort += effort;
    });

    // Si hay distribución parcial, normalizar
    if (totalEffort > 0 && totalEffort !== 1.0) {
      categories.forEach(category => {
        normalizedDistribution[category] = (normalizedDistribution[category] || 0) / totalEffort;
      });
    }

    // Si todas las categorías están representadas, usar distribución conocida
    if (totalEffort > 0) {
      return normalizedDistribution;
    }
  }

  // 2. PRIORIDAD MEDIA: Detectar patrones por nombre
  const patternDistribution = detectExercisePattern(exerciseName);
  if (patternDistribution) {
    // Adaptar patrón a las categorías disponibles
    const adaptedDistribution: Record<string, number> = {};
    let totalPatternEffort = 0;

    categories.forEach(category => {
      const effort = patternDistribution[category] || 0;
      adaptedDistribution[category] = effort;
      totalPatternEffort += effort;
    });

    // Si el patrón cubre algunas categorías, normalizar
    if (totalPatternEffort > 0) {
      // Normalizar las categorías cubiertas por el patrón
      categories.forEach(category => {
        if (patternDistribution[category]) {
          adaptedDistribution[category] = patternDistribution[category] / totalPatternEffort;
        }
      });

      // Distribuir el resto equitativamente entre categorías no cubiertas  
      const uncoveredCategories = categories.filter(cat => !patternDistribution[cat]);
      if (uncoveredCategories.length > 0) {
        const remainingEffort = 1.0 - totalPatternEffort;
        const effortPerUncovered = remainingEffort / uncoveredCategories.length;
        uncoveredCategories.forEach(category => {
          adaptedDistribution[category] = effortPerUncovered;
        });
      }

      return adaptedDistribution;
    }
  }

  // 3. FALLBACK: Distribución conservadora
  console.log(`⚠️ Ejercicio desconocido: "${exerciseName}" - usando distribución conservadora`);
  return getConservativeDistribution(categories);
}; 