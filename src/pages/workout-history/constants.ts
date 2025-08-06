export const WORKOUT_HISTORY_CONSTANTS = {
  DEFAULT_RECORDS_LIMIT: 20,
  SORT_OPTIONS: [
    { value: 'date', label: '📅 Fecha' },
    { value: 'exercise', label: '🏋️ Ejercicio' },
    { value: 'weight', label: '⚖️ Peso' },
    { value: 'volume', label: '📊 Volumen' },
  ],
  SORT_ORDER_OPTIONS: [
    { value: 'desc', label: '⬇️ Descendente' },
    { value: 'asc', label: '⬆️ Ascendente' },
  ],
  QUICK_DATE_FILTERS: {
    LAST_WEEK: 'Última semana',
    LAST_MONTH: 'Último mes',
  },
} as const;
