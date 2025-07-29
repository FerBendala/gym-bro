export const CALENDAR_CONSTANTS = {
  STATS_CARDS: [
    {
      key: 'totalWorkouts',
      title: 'Ejercicios',
      color: 'text-blue-400',
      tooltipContent: 'Número total de ejercicios registrados en el mes actual.',
    },
    {
      key: 'uniqueDays',
      title: 'Días activos',
      color: 'text-green-400',
      tooltipContent: 'Número de días únicos en los que has entrenado este mes.',
    },
    {
      key: 'totalVolume',
      title: 'Volumen total',
      color: 'text-purple-400',
      tooltipContent: 'Suma total de peso levantado (peso × repeticiones × series) en el mes.',
      suffix: ' kg',
    },
    {
      key: 'averageVolumePerDay',
      title: 'Promedio/día',
      color: 'text-yellow-400',
      tooltipContent: 'Volumen promedio de entrenamiento por día activo en el mes.',
      suffix: ' kg',
    },
  ],
} as const;
