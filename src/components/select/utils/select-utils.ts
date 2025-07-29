import { THEME_FORM, THEME_SELECT, ThemeSelectSize, ThemeSelectValidation, ThemeSelectVariant } from '@/constants/theme';
import { cn } from '@/utils';

export const buildSelectClasses = (
  size: ThemeSelectSize,
  variant: ThemeSelectVariant,
  validationState: ThemeSelectValidation,
  className?: string,
): string => {
  return cn(
    THEME_SELECT.base,
    THEME_SELECT.focus,
    THEME_SELECT.sizes[size],
    THEME_SELECT.variants[variant],
    THEME_SELECT.validation[validationState],
    className,
  );
};

export const buildLabelClasses = (
  size: ThemeSelectSize,
  hasError: boolean,
): string => {
  return cn(
    THEME_FORM.label.base,
    THEME_FORM.label.sizes[size],
    hasError ? THEME_FORM.label.colors.error : THEME_FORM.label.colors.default,
  );
};

export const buildErrorClasses = (size: ThemeSelectSize): string => {
  return cn(
    THEME_FORM.error.base,
    THEME_FORM.error.sizes[size],
  );
};

export const buildHelperClasses = (size: ThemeSelectSize): string => {
  return cn(
    THEME_FORM.helper.base,
    THEME_FORM.helper.sizes[size],
  );
};

export const buildOptionClasses = (isDisabled: boolean): string => {
  return cn(
    THEME_SELECT.option.base,
    isDisabled && THEME_SELECT.option.disabled,
  );
};

export const buildGroupOptionClasses = (isDisabled: boolean): string => {
  return cn(
    THEME_SELECT.option.base,
    'pl-4', // Identación para opciones dentro de grupos
    isDisabled && THEME_SELECT.option.disabled,
  );
};

export const determineValidationState = (
  validation?: ThemeSelectValidation,
  error?: string,
): ThemeSelectValidation => {
  return validation || (error ? 'error' : 'default');
};

export const shouldUseGroups = (groups: unknown[]): boolean => {
  return groups.length > 0;
};
