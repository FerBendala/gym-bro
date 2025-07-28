import React from 'react';
import {
  CATEGORY_COLORS,
  CATEGORY_ICONS
} from '../../constants/exercise.constants';

/**
 * Utilidad para obtener el icono de una categoría
 */
export const getCategoryIcon = (category: string): React.FC<React.SVGProps<SVGSVGElement>> => {
  return CATEGORY_ICONS[category] || CATEGORY_ICONS['Sin categoría'];
};

/**
 * Utilidad para obtener el color de gradiente de una categoría
 */
export const getCategoryColor = (category: string): string => {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS['Sin categoría'];
};