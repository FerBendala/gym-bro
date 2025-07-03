import React, { forwardRef } from 'react';
import { THEME_FORM, THEME_INPUT, THEME_RESPONSIVE } from '../../constants/theme';
import type { UISize } from '../../interfaces';
import { cn, validateSize, validateVariant } from '../../utils/functions';

type InputVariant = 'default' | 'filled' | 'outline';
type InputValidation = 'error' | 'success' | 'warning';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  sizeVariant?: UISize;
  variant?: InputVariant;
  validation?: InputValidation;
}

/**
 * Componente Input genérico usando sistema de tema
 * Soporta variantes, tamaños y estados de validación consistentes
 * Optimizado para móvil con touch targets apropiados
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  sizeVariant = 'md',
  variant = 'default',
  validation,
  className,
  ...props
}, ref) => {
  // Validar y normalizar props
  const validSize = validateSize(sizeVariant, ['sm', 'md', 'lg'] as const, 'md');
  const validVariant = validateVariant(variant, ['default', 'filled', 'outline'] as const, 'default');

  // Determinar estado de validación
  const validationState = error ? 'error' : validation;
  const labelColor = error ? 'error' : 'default';

  // Construir clases del input usando sistema de tema y responsive
  const inputClasses = cn(
    THEME_INPUT.base,
    THEME_INPUT.background,
    THEME_INPUT.border.default,
    THEME_INPUT.focus.default,
    // Touch targets responsive para mobile
    sizeVariant === 'sm' ? cn(
      THEME_RESPONSIVE.touch.input.mobile,
      THEME_RESPONSIVE.touch.input.tablet
    ) : THEME_INPUT.sizes[validSize],
    THEME_INPUT.variants[validVariant],
    validationState && THEME_INPUT.validation[validationState],
    className
  );

  // Construir clases del label usando sistema de tema
  const labelClasses = cn(
    THEME_FORM.label.base,
    THEME_FORM.label.sizes[validSize],
    THEME_FORM.label.colors[labelColor]
  );

  // Construir clases del texto de error
  const errorClasses = cn(
    THEME_FORM.error.base,
    THEME_FORM.error.sizes[validSize]
  );

  // Construir clases del texto de ayuda
  const helperClasses = cn(
    THEME_FORM.helper.base,
    THEME_FORM.helper.sizes[validSize]
  );

  return (
    <div className="space-y-1">
      {label && (
        <label className={labelClasses}>
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className={errorClasses}>{error}</p>
      )}
      {helperText && !error && (
        <p className={helperClasses}>{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';