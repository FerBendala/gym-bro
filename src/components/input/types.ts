import type { UISize } from '@/interfaces';

export type InputVariant = 'default' | 'filled' | 'outline';
export type InputValidation = 'error' | 'success' | 'warning';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  sizeVariant?: UISize;
  variant?: InputVariant;
  validation?: InputValidation;
}

export interface InputClasses {
  input: string;
  label: string;
  error: string;
  helper: string;
} 