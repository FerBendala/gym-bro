import { useMemo } from 'react';
import type { InputProps } from '../types';
import { buildInputClassesObject } from '../utils';

/**
 * Hook personalizado para el componente Input
 * Maneja la lógica de validación y construcción de clases
 */
export const useInput = (props: InputProps) => {
  const {
    label,
    error,
    helperText,
    sizeVariant = 'md',
    variant = 'default',
    validation,
    className,
    ...inputProps
  } = props;

  // Construir clases CSS usando useMemo para optimización
  const classes = useMemo(() => {
    return buildInputClassesObject({
      sizeVariant,
      variant,
      error,
      validation,
      className,
    });
  }, [sizeVariant, variant, error, validation, className]);

  // Determinar si mostrar texto de ayuda
  const shouldShowHelper = helperText && !error;

  return {
    // Props del input
    inputProps,

    // Clases CSS
    classes,

    // Estado de validación
    hasError: !!error,
    hasHelper: !!helperText,
    shouldShowHelper,

    // Contenido
    label,
    error,
    helperText,
  };
}; 