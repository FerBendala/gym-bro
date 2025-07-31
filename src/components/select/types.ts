import React from 'react';

import { InputSize, InputVariant } from '@/constants/theme';
import { SelectGroup, SelectOption } from '@/interfaces';

// Tipos específicos para Select basados en los tipos existentes
export type SelectSize = InputSize;
export type SelectVariant = InputVariant;
export type SelectValidation = 'default' | 'success' | 'error';

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  groups?: SelectGroup[];
  placeholder?: string;
  size?: SelectSize;
  variant?: SelectVariant;
  validation?: SelectValidation;
}

export interface SelectButtonProps {
  isOpen: boolean;
  disabled?: boolean;
  hasError: boolean;
  size: SelectSize;
  displayText?: string;
  placeholder?: string;
  onToggle: () => void;
}

export interface SelectDropdownProps {
  isOpen: boolean;
  disabled?: boolean;
  options?: SelectOption[];
  groups?: SelectGroup[];
  selectedValue?: string;
  onOptionSelect: (value: string) => void;
  placeholder?: string;
  dropdownRef?: React.RefObject<HTMLDivElement>;
}

export interface SelectLabelProps {
  label: string;
  size: SelectSize;
  hasError: boolean;
}

export interface SelectFeedbackProps {
  error?: string;
  helperText?: string;
  size: SelectSize;
}

// Re-exportar tipos de interfaces/ui para mantener compatibilidad
export type { SelectGroup, SelectOption } from '@/interfaces/ui.interfaces';
