export const DAY_MAP: Record<string, string> = {
  'lunes': 'lunes',
  'martes': 'martes',
  'miércoles': 'miércoles',
  'jueves': 'jueves',
  'viernes': 'viernes',
  'sábado': 'sábado',
  'domingo': 'domingo',
};

export const PAGE_TITLES = {
  home: 'Entrenamientos',
  progress: 'Mi Progreso',
  calendar: 'Calendario',
  chat: 'IA Chat',
  settings: 'Configuración',
  history: 'Historial de Entrenamientos',
  default: 'Gym Tracker',
} as const;

export const PAGE_SUBTITLES = {
  progress: 'Análisis de rendimiento y mejoras',
  calendar: 'Vista mensual de entrenamientos',
  chat: 'Asistente IA de entrenamiento',
  settings: 'Ejercicios y preferencias',
  history: 'Resumen de tus entrenamientos',
} as const;
