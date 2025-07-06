import { Info } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../../utils/functions';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click';
  showIcon?: boolean;
  delay?: number;
  className?: string;
}

/**
 * Componente de tooltip moderno con animaciones suaves
 * Soporta diferentes posiciones y triggers
 */
export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  trigger = 'hover',
  showIcon = false,
  delay = 300,
  className
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [finalPosition, setFinalPosition] = useState(position);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const triggerRef = useRef<HTMLDivElement>(null);

  // Calcular posición óptima basándose solo en el trigger y viewport
  const calculateOptimalPosition = (): 'top' | 'bottom' | 'left' | 'right' => {
    if (!triggerRef.current) return position;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Dimensiones estimadas del tooltip (más conservadoras)
    const tooltipWidth = 320;
    const tooltipHeight = 120; // Más generoso para contenido largo
    const margin = 20;

    // Calcular espacio disponible en cada dirección
    const spaceTop = triggerRect.top;
    const spaceBottom = viewportHeight - triggerRect.bottom;
    const spaceLeft = triggerRect.left;
    const spaceRight = viewportWidth - triggerRect.right;

    // Determinar la mejor posición basada en el espacio disponible
    switch (position) {
      case 'top':
        return spaceTop >= tooltipHeight + margin ? 'top' : 'bottom';
      case 'bottom':
        return spaceBottom >= tooltipHeight + margin ? 'bottom' : 'top';
      case 'left':
        return spaceLeft >= tooltipWidth + margin ? 'left' : 'right';
      case 'right':
        return spaceRight >= tooltipWidth + margin ? 'right' : 'left';
      default:
        return position;
    }
  };

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      // Calcular posición inmediatamente antes de mostrar
      const optimalPosition = calculateOptimalPosition();
      setFinalPosition(optimalPosition);
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      showTooltip();
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      hideTooltip();
    }
  };

  const handleClick = () => {
    if (trigger === 'click') {
      if (isVisible) {
        hideTooltip();
      } else {
        showTooltip();
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Clases de posicionamiento
  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  // Clases de flecha
  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-gray-800',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-gray-800',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-gray-800',
    right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-gray-800'
  };

  return (
    <div
      ref={triggerRef}
      className={cn('relative inline-block', className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {/* Elemento trigger */}
      <div className="flex items-center space-x-1">
        {children}
        {showIcon && (
          <Info className="w-4 h-4 text-gray-400 hover:text-gray-300 transition-colors" />
        )}
      </div>

      {/* Tooltip */}
      {isVisible && (
        <div
          className={cn(
            'absolute z-50 px-4 py-3 text-sm text-white rounded-lg shadow-lg pointer-events-none',
            'bg-gray-800 border border-gray-700',
            'backdrop-blur-sm',
            'animate-tooltip',
            positionClasses[finalPosition]
          )}
          style={{
            maxWidth: '320px',
            minWidth: '200px',
            wordWrap: 'break-word',
            lineHeight: '1.4'
          }}
        >
          {content}

          {/* Flecha */}
          <div
            className={cn(
              'absolute w-0 h-0 border-4',
              arrowClasses[finalPosition]
            )}
          />
        </div>
      )}
    </div>
  );
};

/**
 * Componente de tooltip simple para iconos de información
 */
export const InfoTooltip: React.FC<{
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}> = ({ content, position = 'top', className }) => {
  return (
    <Tooltip
      content={content}
      position={position}
      trigger="hover"
      className={className}
    >
      <Info className="w-4 h-4 text-gray-400 hover:text-blue-400 transition-colors cursor-help" />
    </Tooltip>
  );
}; 