import { THEME_INPUT } from '@/constants/theme/index.constants';
import { cn } from '@/utils';
import { ChevronDown } from 'lucide-react';
import React from 'react';
import { MULTI_SELECT_CLASSES } from '../constants';
import { MultiSelectButtonProps } from '../types';

export const MultiSelectButton: React.FC<MultiSelectButtonProps> = ({
  isOpen,
  disabled,
  hasError,
  size,
  displayText,
  hasValue,
  onToggle
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        THEME_INPUT.base,
        THEME_INPUT.background,
        THEME_INPUT.border.default,
        THEME_INPUT.sizes[size],
        MULTI_SELECT_CLASSES.button,
        disabled && MULTI_SELECT_CLASSES.buttonDisabled,
        hasError && THEME_INPUT.validation.error,
        isOpen && MULTI_SELECT_CLASSES.buttonOpen
      )}
      disabled={disabled}
    >
      <span className={cn(
        !hasValue && MULTI_SELECT_CLASSES.placeholder
      )}>
        {displayText}
      </span>
      <ChevronDown className={cn(
        MULTI_SELECT_CLASSES.chevron,
        isOpen && MULTI_SELECT_CLASSES.chevronOpen
      )} />
    </button>
  );
}; 