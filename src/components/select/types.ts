import { ThemeSelectSize, ThemeSelectValidation, ThemeSelectVariant } from '@/constants/theme/index.constants';
import React from 'react';

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

export interface SelectLabelProps {
  label: string;
  size: ThemeSelectSize;
  hasError: boolean;
}

export interface SelectFieldProps {
  ref: React.Ref<HTMLSelectElement>;
  className: string;
  placeholder?: string;
  useGroups: boolean;
  groups: SelectGroup[];
  options: SelectOption[];
  props: Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'>;
}

export interface SelectOptionsProps {
  options: SelectOption[];
}

export interface SelectGroupsProps {
  groups: SelectGroup[];
}

export interface SelectFeedbackProps {
  error?: string;
  helperText?: string;
  size: ThemeSelectSize;
}

// Re-exportar tipos de interfaces/ui para mantener compatibilidad
export type { SelectGroup, SelectOption } from '@/interfaces/ui.interfaces';
