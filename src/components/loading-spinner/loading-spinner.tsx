import React from 'react';

import { SpinnerSVG } from './components';
import { useSpinner } from './hooks';
import type { LoadingSpinnerProps } from './types';

/**
 * Componente genérico de spinner de loading usando sistema de tema
 * Reutilizable en botones, overlays, estados de carga, etc.
 * Soporta múltiples tamaños, colores y variantes consistentes
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = (props) => {
  const { spinnerClasses } = useSpinner(props);

  return <SpinnerSVG className={spinnerClasses} />;
};
