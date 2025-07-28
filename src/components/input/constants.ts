import { THEME_FORM, THEME_INPUT, THEME_RESPONSIVE } from '@/constants/theme/index.constants';

export const INPUT_CONSTANTS = {
  DEFAULT_SIZE: 'md' as const,
  DEFAULT_VARIANT: 'default' as const,
  VALID_SIZES: ['sm', 'md', 'lg'] as const,
  VALID_VARIANTS: ['default', 'filled', 'outline'] as const,
  VALID_VALIDATIONS: ['error', 'success', 'warning'] as const,
} as const;

export const INPUT_THEME = {
  FORM: THEME_FORM,
  INPUT: THEME_INPUT,
  RESPONSIVE: THEME_RESPONSIVE,
} as const; 