import { THEME_SELECT } from '@/constants/theme';
import { forwardRef } from 'react';
import { SelectFeedback, SelectGroups, SelectLabel, SelectOptions } from './components';
import { useSelect } from './hooks';
import { SelectProps } from './types';

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
  const { useGroups, selectClasses, hasError } = useSelect({
    error,
    groups,
    size,
    variant,
    validation,
    className,
  });

  return (
    <div className={THEME_SELECT.container}>
      {label && (
        <SelectLabel
          label={label}
          size={size}
          hasError={hasError}
        />
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
          <SelectGroups groups={groups} />
        ) : (
          <SelectOptions options={options} />
        )}
      </select>

      <SelectFeedback
        error={error}
        helperText={helperText}
        size={size}
      />
    </div>
  );
});

Select.displayName = 'Select'; 