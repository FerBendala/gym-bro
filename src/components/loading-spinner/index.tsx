import React from 'react';
import { THEME_SPINNER, type ThemeSpinnerColor, type ThemeSpinnerSize, type ThemeSpinnerVariant } from '../../constants/theme';
import { cn, validateSize, validateVariant } from '../../utils/functions';

interface LoadingSpinnerProps {
  size?: ThemeSpinnerSize;
  color?: ThemeSpinnerColor;
  variant?: ThemeSpinnerVariant;
  className?: string;
}

/**
 * Componente genérico de spinner de loading usando sistema de tema
 * Reutilizable en botones, overlays, estados de carga, etc.
 * Soporta múltiples tamaños, colores y variantes consistentes
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'default',
  variant = 'default',
  className
}) => {
  // Validar y normalizar props usando utilidades genéricas
  const validSize = validateSize(size, ['xs', 'sm', 'md', 'lg', 'xl'] as const, 'md');
  const validColor = validateVariant(color, ['default', 'primary', 'success', 'warning', 'danger', 'white', 'gray'] as const, 'default');
  const validVariant = validateVariant(variant, ['default', 'light', 'subtle'] as const, 'default');

  // Construir clases usando sistema de tema y utilidades de estilo
  const spinnerClasses = cn(
    THEME_SPINNER.base,
    THEME_SPINNER.sizes[validSize],
    THEME_SPINNER.colors[validColor],
    THEME_SPINNER.variants[validVariant],
    className
  );

  return (
    <svg
      className={spinnerClasses}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      role="img"
      aria-label="Cargando..."
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}; 