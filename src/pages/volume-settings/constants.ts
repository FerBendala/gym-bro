export const VOLUME_SETTINGS_CONSTANTS = {
  SLIDER: {
    MIN: 0,
    MAX: 50,
    STEP: 0.5,
  },
  INPUT: {
    MIN: 0,
    MAX: 100,
    STEP: 0.5,
  },
  TOLERANCE: 0.1,
  TARGET_TOTAL: 100,
} as const;

export const VOLUME_SETTINGS_MESSAGES = {
  LOADING: 'Cargando configuración...',
  SAVE_SUCCESS: 'Configuración de volumen guardada correctamente',
  SAVE_ERROR: 'Error al guardar la configuración',
  RESET_SUCCESS: 'Configuración restablecida a valores por defecto',
  NORMALIZE_SUCCESS: 'Porcentajes normalizados a 100%',
  TOTAL_ERROR: 'La suma de todos los porcentajes debe ser exactamente 100%',
  TOTAL_CORRECT: 'Distribución correcta',
  TOTAL_EXCEEDS: 'Excede el 100% - ajusta los valores',
  TOTAL_INCOMPLETE: 'Falta para llegar al 100%',
  SAVING: 'Guardando...',
  SAVE_CONFIG: 'Guardar Configuración',
} as const;

export const VOLUME_SETTINGS_TIPS = [
  'Los porcentajes representan la distribución ideal de volumen de entrenamiento',
  'La suma de todos los porcentajes debe ser exactamente 100%',
  'Puedes usar el botón "Normalizar" para ajustar automáticamente a 100%',
  'Los valores por defecto están basados en principios de anatomía funcional',
  'Estos valores afectan el análisis de balance muscular en el dashboard',
] as const; 