import { cn } from '@/utils/functions';
import { INPUT_CONSTANTS, INPUT_THEME } from '../constants';
import type { InputClasses, InputProps, InputValidation } from '../types';

/**
 * Valida y normaliza el tamaño del input
 */
export const validateInputSize = (size: string | undefined): 'sm' | 'md' | 'lg' => {
  if (!size || !INPUT_CONSTANTS.VALID_SIZES.includes(size as any)) {
    return INPUT_CONSTANTS.DEFAULT_SIZE;
  }
  return size as 'sm' | 'md' | 'lg';
};

/**
 * Valida y normaliza la variante del input
 */
export const validateInputVariant = (variant: string | undefined): 'default' | 'filled' | 'outline' => {
  if (!variant || !INPUT_CONSTANTS.VALID_VARIANTS.includes(variant as any)) {
    return INPUT_CONSTANTS.DEFAULT_VARIANT;
  }
  return variant as 'default' | 'filled' | 'outline';
};

/**
 * Determina el estado de validación del input
 */
export const getValidationState = (error?: string, validation?: InputValidation): InputValidation | undefined => {
  if (error) return 'error';
  return validation;
};

/**
 * Construye las clases CSS para el input
 */
export const buildInputClasses = (
  sizeVariant: string,
  variant: string,
  validationState?: InputValidation,
  className?: string
): string => {
  const validSize = validateInputSize(sizeVariant);
  const validVariant = validateInputVariant(variant);

  return cn(
    INPUT_THEME.INPUT.base,
    INPUT_THEME.INPUT.background,
    INPUT_THEME.INPUT.border.default,
    INPUT_THEME.INPUT.focus.default,
    // Touch targets responsive para mobile
    validSize === 'sm' ? cn(
      INPUT_THEME.RESPONSIVE.touch.input.mobile,
      INPUT_THEME.RESPONSIVE.touch.input.tablet
    ) : INPUT_THEME.INPUT.sizes[validSize],
    INPUT_THEME.INPUT.variants[validVariant],
    validationState && INPUT_THEME.INPUT.validation[validationState],
    className
  );
};

/**
 * Construye las clases CSS para el label
 */
export const buildLabelClasses = (sizeVariant: string, hasError: boolean): string => {
  const validSize = validateInputSize(sizeVariant);
  const labelColor = hasError ? 'error' : 'default';

  return cn(
    INPUT_THEME.FORM.label.base,
    INPUT_THEME.FORM.label.sizes[validSize],
    INPUT_THEME.FORM.label.colors[labelColor]
  );
};

/**
 * Construye las clases CSS para el texto de error
 */
export const buildErrorClasses = (sizeVariant: string): string => {
  const validSize = validateInputSize(sizeVariant);

  return cn(
    INPUT_THEME.FORM.error.base,
    INPUT_THEME.FORM.error.sizes[validSize]
  );
};

/**
 * Construye las clases CSS para el texto de ayuda
 */
export const buildHelperClasses = (sizeVariant: string): string => {
  const validSize = validateInputSize(sizeVariant);

  return cn(
    INPUT_THEME.FORM.helper.base,
    INPUT_THEME.FORM.helper.sizes[validSize]
  );
};

/**
 * Construye todas las clases CSS para el componente Input
 */
export const buildInputClassesObject = (props: InputProps): InputClasses => {
  const { sizeVariant = 'md', variant = 'default', error, validation, className } = props;

  const validSize = validateInputSize(sizeVariant);
  const validVariant = validateInputVariant(variant);
  const validationState = getValidationState(error, validation);

  return {
    input: buildInputClasses(validSize, validVariant, validationState, className),
    label: buildLabelClasses(validSize, !!error),
    error: buildErrorClasses(validSize),
    helper: buildHelperClasses(validSize),
  };
}; 