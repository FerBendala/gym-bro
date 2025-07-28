
/**
 * Clasifica el volumen de entrenamiento en categorías
 */
export const classifyVolumeLevel = (volume: number): 'bajo' | 'moderado' | 'alto' | 'muy_alto' | 'extremo' => {
  if (volume < 100) return 'bajo';
  if (volume < 500) return 'moderado';
  if (volume < 1000) return 'alto';
  if (volume < 2000) return 'muy_alto';
  return 'extremo';
};

/**
 * Obtiene el color correspondiente a un nivel de volumen
 */
export const getVolumeColor = (volume: number): string => {
  const level = classifyVolumeLevel(volume);
  const colors = {
    bajo: 'text-gray-400',
    moderado: 'text-blue-400',
    alto: 'text-green-400',
    muy_alto: 'text-yellow-400',
    extremo: 'text-red-400'
  };
  return colors[level];
};