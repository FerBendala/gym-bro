import { clsx, type ClassValue } from 'clsx';

/**
 * Utilidades genéricas para manejo de estilos y clases CSS
 * Reutilizable en Input, Button, Card, y otros componentes UI
 */

/**
 * Combina clases CSS de manera inteligente usando clsx
 * Alias para clsx con tipado mejorado
 */
export const cn = (...inputs: ClassValue[]): string => {
  return clsx(inputs);
};

/**
 * Combina estilos base con variantes y modificadores
 */
export const combineStyles = (
  base: string,
  variants: Record<string, string> = {},
  modifiers: Record<string, boolean> = {},
  className?: string
): string => {
  const variantClasses = Object.values(variants).join(' ');
  const modifierClasses = Object.entries(modifiers)
    .filter(([, condition]) => condition)
    .map(([key]) => key)
    .join(' ');

  return cn(base, variantClasses, modifierClasses, className);
};

/**
 * Genera clases condicionales basadas en estado
 */
export const conditionalClasses = (
  conditions: Record<string, boolean | undefined>
): string => {
  return Object.entries(conditions)
    .filter(([, condition]) => Boolean(condition))
    .map(([className]) => className)
    .join(' ');
};

/**
 * Valida y formatea tamaños para componentes
 */
export const validateSize = <T extends string>(
  size: T | undefined,
  allowedSizes: readonly T[],
  defaultSize: T
): T => {
  if (!size) return defaultSize;
  return allowedSizes.includes(size) ? size : defaultSize;
};

/**
 * Valida y formatea variantes para componentes
 */
export const validateVariant = <T extends string>(
  variant: T | undefined,
  allowedVariants: readonly T[],
  defaultVariant: T
): T => {
  if (!variant) return defaultVariant;
  return allowedVariants.includes(variant) ? variant : defaultVariant;
}; 