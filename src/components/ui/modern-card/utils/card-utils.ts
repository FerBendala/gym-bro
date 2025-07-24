import { cn } from '@/utils/functions/style-utils';
import {
  CARD_BASE_CLASSES,
  CARD_CONTENT_CLASSES,
  CARD_FOOTER_CLASSES,
  CARD_HEADER_CLASSES,
  CARD_PADDING,
  CARD_VARIANTS
} from '../constants';
import type { ModernCardPadding, ModernCardVariant } from '../types';

/**
 * Genera las clases CSS para la tarjeta base
 */
export const getCardClasses = (
  variant: ModernCardVariant,
  padding: ModernCardPadding,
  onClick?: () => void,
  isClickable?: boolean,
  isActive?: boolean,
  className?: string
): string => {
  return cn(
    CARD_BASE_CLASSES,
    CARD_VARIANTS[variant],
    CARD_PADDING[padding],
    (onClick || isClickable) && [
      'cursor-pointer',
      'hover:scale-[1.02]',
      'active:scale-95'
    ],
    isActive && 'ring-2 ring-blue-500/50',
    className
  );
};

/**
 * Genera las clases CSS para el header de la tarjeta
 */
export const getCardHeaderClasses = (className?: string): string => {
  return cn(CARD_HEADER_CLASSES, className);
};

/**
 * Genera las clases CSS para el contenido de la tarjeta
 */
export const getCardContentClasses = (className?: string): string => {
  return cn(CARD_CONTENT_CLASSES, className);
};

/**
 * Genera las clases CSS para el footer de la tarjeta
 */
export const getCardFooterClasses = (className?: string): string => {
  return cn(CARD_FOOTER_CLASSES, className);
}; 