import { useEffect, useRef, useState } from 'react';
import { TooltipPosition, TooltipTrigger } from '../types';
import { calculateOptimalPosition } from '../utils';

interface UseTooltipProps {
  position: TooltipPosition;
  trigger: TooltipTrigger;
  delay: number;
}

export const useTooltip = ({ position, trigger, delay }: UseTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [finalPosition, setFinalPosition] = useState(position);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const triggerRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const optimalPosition = calculateOptimalPosition(triggerRef.current, position);
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

  return {
    isVisible,
    finalPosition,
    triggerRef,
    handleMouseEnter,
    handleMouseLeave,
    handleClick
  };
}; 