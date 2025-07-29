/**
 * Constantes específicas del ExerciseCard
 * Valores fijos y configuraciones del componente
 */
export const EXERCISE_CARD_CONSTANTS = {
  // Valores por defecto del formulario
  DEFAULT_FORM_VALUES: {
    weight: 0,
    reps: 1,
    sets: 1,
    date: new Date(),
  },

  // Valores por defecto del formulario avanzado
  DEFAULT_ADVANCED_FORM_VALUES: {
    sets: [],
    date: new Date(),
  },

  // Configuración de series individuales
  INDIVIDUAL_SETS: {
    defaultSet: { weight: 0, reps: 1 },
    minSets: 1,
  },

  // Mensajes de error
  ERROR_MESSAGES: {
    weight: {
      required: 'El peso es requerido',
      min: 'El peso debe ser positivo',
    },
    reps: {
      required: 'Las repeticiones son requeridas',
      min: 'Mínimo 1 repetición',
    },
    sets: {
      required: 'Las series son requeridas',
      min: 'Mínimo 1 serie',
    },
  },

  // Configuración del modal
  MODAL: {
    portalId: 'modal-root',
    zIndex: 70,
  },

  // Configuración de estadísticas
  STATS: {
    decimalPlaces: 2,
    volumeUnit: 'kg',
  },
};
