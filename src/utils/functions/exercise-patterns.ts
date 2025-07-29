import { KNOWN_EXERCISE_DISTRIBUTIONS } from '@/constants';

/**
 * Patrones de ejercicios para detectar distribuciones inteligentes por palabras clave
 */
const EXERCISE_PATTERNS: {
  patterns: string[];
  distribution: Record<string, number>;
  description: string;
}[] = [
  // PIERNAS
  {
    patterns: ['press.*pierna', 'leg.*press', 'sentadilla', 'squat'],
    distribution: { 'Piernas': 0.9, 'Core': 0.1 },
    description: 'Ejercicio principal de piernas',
  },
  {
    patterns: ['extensión.*cuádriceps', 'extensiones.*cuádriceps', 'quad.*extension'],
    distribution: { 'Piernas': 1.0 },
    description: 'Aislamiento de cuádriceps',
  },
  {
    patterns: ['curl.*femoral', 'hamstring.*curl'],
    distribution: { 'Piernas': 1.0 },
    description: 'Aislamiento de isquiotibiales',
  },
  {
    patterns: ['talones', 'pantorrill', 'calf.*raise'],
    distribution: { 'Piernas': 1.0 },
    description: 'Entrenamiento de pantorrillas',
  },

  // PECHO
  {
    patterns: ['press.*banca', 'bench.*press', 'press.*banco'],
    distribution: { 'Pecho': 0.7, 'Hombros': 0.2, 'Brazos': 0.1 },
    description: 'Press de pecho básico',
  },
  {
    patterns: ['fondos', 'dips'],
    distribution: { 'Pecho': 0.6, 'Brazos': 0.3, 'Hombros': 0.1 },
    description: 'Fondos en paralelas',
  },
  {
    patterns: ['cruces', 'flies', 'aperturas.*pecho'],
    distribution: { 'Pecho': 0.9, 'Hombros': 0.1 },
    description: 'Ejercicio de aislamiento de pecho',
  },

  // ESPALDA
  {
    patterns: ['dominadas', 'pull.*up', 'chin.*up'],
    distribution: { 'Espalda': 0.7, 'Brazos': 0.3 },
    description: 'Dominadas y variaciones',
  },
  {
    patterns: ['remo', 'row'],
    distribution: { 'Espalda': 0.8, 'Brazos': 0.2 },
    description: 'Ejercicios de remo',
  },
  {
    patterns: ['pullover'],
    distribution: { 'Pecho': 0.6, 'Espalda': 0.4 },
    description: 'Pullover (híbrido pecho-espalda)',
  },

  // HOMBROS
  {
    patterns: ['press.*militar', 'overhead.*press', 'press.*hombro'],
    distribution: { 'Hombros': 0.7, 'Brazos': 0.2, 'Core': 0.1 },
    description: 'Press militar y variaciones',
  },
  {
    patterns: ['elevaciones.*laterales', 'lateral.*raise'],
    distribution: { 'Hombros': 1.0 },
    description: 'Elevaciones laterales',
  },
  {
    patterns: ['elevaciones.*frontales', 'front.*raise'],
    distribution: { 'Hombros': 1.0 },
    description: 'Elevaciones frontales',
  },
  {
    patterns: ['pájaros', 'rear.*delt', 'aperturas.*invert'],
    distribution: { 'Hombros': 0.8, 'Espalda': 0.2 },
    description: 'Deltoides posterior',
  },

  // BRAZOS
  {
    patterns: ['curl.*bíceps', 'bicep.*curl'],
    distribution: { 'Brazos': 1.0 },
    description: 'Ejercicios de bíceps',
  },
  {
    patterns: ['extensión.*tríceps', 'tricep.*extension'],
    distribution: { 'Brazos': 1.0 },
    description: 'Ejercicios de tríceps',
  },

  // CORE
  {
    patterns: ['plancha', 'plank'],
    distribution: { 'Core': 1.0 },
    description: 'Plancha abdominal',
  },
  {
    patterns: ['abdominal', 'crunch', 'sit.*up'],
    distribution: { 'Core': 1.0 },
    description: 'Ejercicios abdominales',
  },
  {
    patterns: ['rueda.*abdominal', 'ab.*wheel'],
    distribution: { 'Core': 0.9, 'Brazos': 0.1 },
    description: 'Rueda abdominal',
  },
];

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
const getConservativeDistribution = (categories: string[]): Record<string, number> => {
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
};

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
  exerciseName?: string,
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
  return getConservativeDistribution(categories);
};
