/**
 * Constantes del componente ExerciseProgressChart
 */

export const CHART_DIMENSIONS = {
  width: 600,
  height: 400,
  padding: 50,
} as const;

export const CHART_EMPTY_STATE = {
  defaultHeight: 120,
  defaultMessage: 'No hay datos suficientes para mostrar el gráfico',
} as const;

export const CHART_INFO_ITEMS = [
  {
    color: 'bg-blue-500',
    text: 'Líneas ascendentes = Mejora en fuerza',
  },
  {
    color: 'bg-yellow-500',
    text: 'Considera peso × repeticiones',
  },
  {
    color: 'bg-green-500',
    text: '1RM = Fórmula de Epley',
  },
  {
    color: 'bg-purple-500',
    text: 'Hover para ver peso real + estimado',
  },
] as const;
