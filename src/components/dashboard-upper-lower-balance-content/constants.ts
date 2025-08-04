// Constantes centralizadas para meta-categorías
export const META_CATEGORIES = {
  UPPER_BODY: {
    name: 'Tren Superior',
    categories: ['Pecho', 'Espalda', 'Hombros', 'Brazos'],
    color: '#3B82F6',
  },
  LOWER_BODY: {
    name: 'Tren Inferior',
    categories: ['Piernas', 'Glúteos'],
    color: '#10B981',
  },
  CORE: {
    name: 'Core',
    categories: ['Core'],
    color: '#6366F1',
  },
} as const;

export const TREND_THRESHOLDS = {
  BALANCE_TOLERANCE: 5,
  MAX_FREQUENCY: 3.5,
  IDEAL_FREQUENCY: 2.5,
  INTENSITY_REDUCTION_FACTOR: 0.9,
  MIN_INTENSITY: 60,
  MAX_INTENSITY: 80,
  // Validaciones adicionales
  MIN_PERCENTAGE: 0,
  MAX_PERCENTAGE: 100,
  MIN_VOLUME: 0,
  MAX_VOLUME: 200000, // 200 toneladas como límite razonable (aumentado de 10,000)
} as const;

// Función de validación para porcentajes
export const validatePercentage = (value: number): number => {
  return Math.max(TREND_THRESHOLDS.MIN_PERCENTAGE, Math.min(TREND_THRESHOLDS.MAX_PERCENTAGE, value));
};

// Función de validación para volúmenes
export const validateVolume = (value: number): number => {
  return Math.max(TREND_THRESHOLDS.MIN_VOLUME, Math.min(TREND_THRESHOLDS.MAX_VOLUME, value));
};

// Función para calcular porcentajes ideales dinámicamente basados en la configuración del usuario
export const calculateIdealPercentages = (userVolumeDistribution: Record<string, number>) => {
  const upperBodyCategories = META_CATEGORIES.UPPER_BODY.categories;
  const lowerBodyCategories = META_CATEGORIES.LOWER_BODY.categories;
  const coreCategories = META_CATEGORIES.CORE.categories;

  // Calcular porcentajes ideales sumando las categorías de cada meta-categoría
  const upperBodyIdeal = upperBodyCategories.reduce((sum, category) => {
    return sum + (userVolumeDistribution[category] || 0);
  }, 0);

  const lowerBodyIdeal = lowerBodyCategories.reduce((sum, category) => {
    return sum + (userVolumeDistribution[category] || 0);
  }, 0);

  const coreIdeal = coreCategories.reduce((sum, category) => {
    return sum + (userVolumeDistribution[category] || 0);
  }, 0);

  return {
    UPPER_BODY: validatePercentage(upperBodyIdeal),
    LOWER_BODY: validatePercentage(lowerBodyIdeal),
    CORE: validatePercentage(coreIdeal),
  };
};
