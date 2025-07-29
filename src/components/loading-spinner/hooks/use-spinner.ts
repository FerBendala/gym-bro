import { useMemo } from 'react';

import type { LoadingSpinnerProps } from '../types';
import { buildSpinnerClasses, validateSpinnerProps } from '../utils';

/**
 * Hook personalizado para el componente LoadingSpinner
 * Maneja la validación de props y construcción de clases
 */
export const useSpinner = (props: LoadingSpinnerProps) => {
  const { validSize, validColor, validVariant } = useMemo(
    () => validateSpinnerProps(props),
    [props],
  );

  const spinnerClasses = useMemo(
    () => buildSpinnerClasses(validSize, validColor, validVariant, props.className),
    [validSize, validColor, validVariant, props.className],
  );

  return {
    spinnerClasses,
    validSize,
    validColor,
    validVariant,
  };
};
