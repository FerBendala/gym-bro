import { useMemo } from 'react';
import type { ModernButtonProps } from '../types';

export const useButtonState = (props: ModernButtonProps) => {
  const { disabled, isLoading } = props;

  const isDisabled = useMemo(() => {
    return disabled || isLoading;
  }, [disabled, isLoading]);

  return {
    isDisabled
  };
}; 