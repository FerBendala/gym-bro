import { useMemo } from 'react';

interface CardInteractionProps {
  onClick?: () => void;
  isClickable?: boolean;
}

export const useCardInteraction = (props: CardInteractionProps) => {
  const { onClick, isClickable } = props;

  const isInteractive = useMemo(() => {
    return onClick || isClickable;
  }, [onClick, isClickable]);

  const Component = useMemo(() => {
    return isInteractive ? 'button' : 'div';
  }, [isInteractive]);

  return {
    isInteractive,
    Component
  };
}; 