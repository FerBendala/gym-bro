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
  const [actualPosition, setActualPosition] = useState(position);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  // Calcular posición óptima basada en el espacio disponible
  const calculatePosition = () => {
    if (!tooltipRef.current || !triggerRef.current) return;

    const tooltip = tooltipRef.current;
    const trigger = triggerRef.current;
    const rect = trigger.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let newPosition = position;

    // Verificar si hay espacio suficiente en la posición preferida
    switch (position) {
      case 'top':
        if (rect.top - tooltipRect.height < 10) {
          newPosition = 'bottom';
        }
        break;
      case 'bottom':
        if (rect.bottom + tooltipRect.height > viewportHeight - 10) {
          newPosition = 'top';
        }
        break;
      case 'left':
        if (rect.left - tooltipRect.width < 10) {
          newPosition = 'right';
        }
        break;
      case 'right':
        if (rect.right + tooltipRect.width > viewportWidth - 10) {
          newPosition = 'left';
        }
        break;
    }

    setActualPosition(newPosition);
  };

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      // Calcular posición después de que el tooltip sea visible
      setTimeout(calculatePosition, 0);
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
          ref={tooltipRef}
          className={cn(
            'absolute z-50 px-4 py-3 text-sm text-white rounded-lg shadow-lg pointer-events-none',
            'bg-gray-800 border border-gray-700',
            'backdrop-blur-sm',
            'animate-tooltip',
            positionClasses[actualPosition]
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
              arrowClasses[actualPosition]
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