import { THEME_FORM } from '@/constants/theme';
import { cn } from '@/utils';
import React from 'react';
import { MultiSelectErrorProps } from '../types';

export const MultiSelectError: React.FC<MultiSelectErrorProps> = ({
  error,
  size
}) => {
  return (
    <p className={cn(
      THEME_FORM.error.base,
      THEME_FORM.error.sizes[size]
    )}>
      {error}
    </p>
  );
}; 