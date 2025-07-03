import React, { forwardRef } from 'react';
import { THEME_FORM, THEME_SELECT, type ThemeSelectSize, type ThemeSelectValidation, type ThemeSelectVariant } from '../../constants/theme';

import { SelectGroup, SelectOption } from '../../interfaces/ui';
import { cn } from '../../utils/functions';

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  groups?: SelectGroup[];
  placeholder?: string;
  size?: ThemeSelectSize;
  variant?: ThemeSelectVariant;
  validation?: ThemeSelectValidation;
}

/**
 * Componente Select usando sistema de tema genérico
 * Integrado completamente con THEME_SELECT, THEME_FORM y utilidades genéricas
 * Soporta tanto opciones simples como grupos de opciones (optgroups)
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  helperText,
  options = [],
  groups = [],
  placeholder,
  size = 'md',
  variant = 'default',
  validation,
  className,
  ...props
}, ref) => {
  // Determinar estado de validación automáticamente
  const validationState = validation || (error ? 'error' : 'default');

  // Construir clases usando sistema de tema y style-utils
  const selectClasses = cn(
    THEME_SELECT.base,
    THEME_SELECT.focus,
    THEME_SELECT.sizes[size],
    THEME_SELECT.variants[variant],
    THEME_SELECT.validation[validationState],
    className
  );

  // Decidir si usar grupos o opciones simples
  const useGroups = groups.length > 0;

  return (
    <div className={THEME_SELECT.container}>
      {label && (
        <label className={cn(
          THEME_FORM.label.base,
          THEME_FORM.label.sizes[size],
          error ? THEME_FORM.label.colors.error : THEME_FORM.label.colors.default
        )}>
          {label}
        </label>
      )}

      <select
        ref={ref}
        className={selectClasses}
        {...props}
      >
        {placeholder && (
          <option value="" disabled className={THEME_SELECT.placeholder.base}>
            {placeholder}
          </option>
        )}

        {useGroups ? (
          // Renderizar grupos de opciones
          groups.map((group) => (
            <optgroup
              key={group.label}
              label={group.label}
              className="text-gray-400 font-semibold bg-gray-800"
            >
              {group.options.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={cn(
                    THEME_SELECT.option.base,
                    "pl-4", // Identación para opciones dentro de grupos
                    option.disabled && THEME_SELECT.option.disabled
                  )}
                >
                  {option.label}
                </option>
              ))}
            </optgroup>
          ))
        ) : (
          // Renderizar opciones simples (compatibilidad hacia atrás)
          options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
              className={cn(
                THEME_SELECT.option.base,
                option.disabled && THEME_SELECT.option.disabled
              )}
            >
              {option.label}
            </option>
          ))
        )}
      </select>

      {error && (
        <p className={cn(
          THEME_FORM.error.base,
          THEME_FORM.error.sizes[size]
        )}>
          {error}
        </p>
      )}

      {helperText && !error && (
        <p className={cn(
          THEME_FORM.helper.base,
          THEME_FORM.helper.sizes[size]
        )}>
          {helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';