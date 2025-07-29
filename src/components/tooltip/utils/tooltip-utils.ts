import { TOOLTIP_DEFAULTS } from '../constants';
import { TooltipPosition } from '../types';

/**
 * Calcula la posición óptima del tooltip basándose en el espacio disponible
 */
export const calculateOptimalPosition = (
  triggerElement: HTMLElement | null,
  preferredPosition: TooltipPosition,
): TooltipPosition => {
  if (!triggerElement) return preferredPosition;

  const triggerRect = triggerElement.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const { TOOLTIP_WIDTH, TOOLTIP_HEIGHT, MARGIN } = TOOLTIP_DEFAULTS;

  // Calcular espacio disponible en cada dirección
  const spaceTop = triggerRect.top;
  const spaceBottom = viewportHeight - triggerRect.bottom;
  const spaceLeft = triggerRect.left;
  const spaceRight = viewportWidth - triggerRect.right;

  // Determinar la mejor posición basada en el espacio disponible
  switch (preferredPosition) {
    case 'top':
      return spaceTop >= TOOLTIP_HEIGHT + MARGIN ? 'top' : 'bottom';
    case 'bottom':
      return spaceBottom >= TOOLTIP_HEIGHT + MARGIN ? 'bottom' : 'top';
    case 'left':
      return spaceLeft >= TOOLTIP_WIDTH + MARGIN ? 'left' : 'right';
    case 'right':
      return spaceRight >= TOOLTIP_WIDTH + MARGIN ? 'right' : 'left';
    default:
      return preferredPosition;
  }
};

/**
 * Obtiene los estilos inline para el tooltip
 */
export const getTooltipStyles = () => ({
  maxWidth: TOOLTIP_DEFAULTS.MAX_WIDTH,
  minWidth: TOOLTIP_DEFAULTS.MIN_WIDTH,
  wordWrap: 'break-word' as const,
  lineHeight: '1.4',
});
