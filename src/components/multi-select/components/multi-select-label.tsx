import { THEME_FORM } from '@/constants/theme/index.constants';
import { cn } from '@/utils/functions';
import React from 'react';
import { MultiSelectLabelProps } from '../types';

export const MultiSelectLabel: React.FC<MultiSelectLabelProps> = ({
  label,
  size,
  hasError
}) => {
  return (
    <label className={cn(
      THEME_FORM.label.base,
      THEME_FORM.label.sizes[size],
      hasError ? THEME_FORM.label.colors.error : THEME_FORM.label.colors.default
    )}>
      {label}
    </label>
  );
}; 