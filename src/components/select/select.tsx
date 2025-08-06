import { forwardRef } from 'react';

import { SelectButton, SelectDropdown, SelectFeedback, SelectLabel } from './components';
import { useSelect } from './hooks';
import { SelectProps } from './types';

import { THEME_SELECT } from '@/constants/theme';
import { cn } from '@/utils';

/**
 * Componente Select moderno con diseño similar al DaySelector
 * Integrado completamente con THEME_SELECT, soporta opciones simples y grupos
 * Diseño moderno con dropdown, backdrop blur y animaciones
 */
export const Select = forwardRef<HTMLDivElement, SelectProps>(({
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
  value,
  onChange,
  disabled = false,
}, ref) => {
  const {
    hasError,
    isOpen,
    dropdownRef,
    displayText,
    handleToggle,
    handleOptionSelect,
  } = useSelect({
    error,
    groups,
    size,
    variant,
    validation,
    className,
    value,
    onChange,
    disabled,
    options,
    placeholder,
  });

  return (
    <div className={cn(THEME_SELECT.container, 'relative z-[999999]')} ref={ref}>
      {label && (
        <SelectLabel
          label={label}
          size={size}
          hasError={hasError}
        />
      )}

      <div className="relative z-[999999]" ref={dropdownRef}>
        <SelectButton
          isOpen={isOpen}
          disabled={disabled}
          hasError={hasError}
          displayText={displayText}
          placeholder={placeholder}
          onToggle={handleToggle}
        />

        <SelectDropdown
          isOpen={isOpen}
          disabled={disabled}
          options={options}
          groups={groups}
          selectedValue={String(value)}
          onOptionSelect={handleOptionSelect}
          placeholder={placeholder}
          dropdownRef={dropdownRef}
        />
      </div>

      <SelectFeedback
        error={error}
        helperText={helperText}
        size={size}
      />
    </div>
  );
});

Select.displayName = 'Select';
