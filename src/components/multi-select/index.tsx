import { Check, ChevronDown } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { THEME_FORM, THEME_INPUT, THEME_SELECT } from '../../constants/theme';
import { cn } from '../../utils/functions';
import { useClickOutside } from './use-click-outside';

export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  label?: string;
  error?: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  error,
  options,
  value = [],
  onChange,
  placeholder = 'Selecciona opciones...',
  disabled = false,
  size = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useClickOutside(dropdownRef, () => setIsOpen(false));

  const toggleOption = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const getDisplayText = () => {
    if (value.length === 0) return placeholder;
    if (value.length === 1) {
      const option = options.find(opt => opt.value === value[0]);
      return option?.label || '';
    }
    return `${value.length} seleccionadas`;
  };

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

      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={cn(
            THEME_INPUT.base,
            THEME_INPUT.background,
            THEME_INPUT.border.default,
            THEME_INPUT.sizes[size],
            'flex items-center justify-between w-full cursor-pointer',
            disabled && 'opacity-50 cursor-not-allowed',
            error && THEME_INPUT.validation.error,
            isOpen && 'ring-2 ring-blue-500 border-transparent'
          )}
          disabled={disabled}
        >
          <span className={cn(
            value.length === 0 && 'text-gray-400'
          )}>
            {getDisplayText()}
          </span>
          <ChevronDown className={cn(
            'w-4 h-4 text-gray-400 transition-transform',
            isOpen && 'transform rotate-180'
          )} />
        </button>

        {isOpen && !disabled && (
          <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
            {options.map((option) => {
              const isSelected = value.includes(option.value);
              return (
                <label
                  key={option.value}
                  className={cn(
                    'flex items-center px-3 py-2 cursor-pointer hover:bg-gray-700 transition-colors',
                    isSelected && 'bg-blue-600/20'
                  )}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={isSelected}
                    onChange={() => toggleOption(option.value)}
                  />
                  <div className={cn(
                    'w-4 h-4 mr-3 border rounded flex items-center justify-center transition-colors',
                    isSelected
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-gray-600'
                  )}>
                    {isSelected && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-sm text-white">{option.label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {error && (
        <p className={cn(
          THEME_FORM.error.base,
          THEME_FORM.error.sizes[size]
        )}>
          {error}
        </p>
      )}
    </div>
  );
}; 