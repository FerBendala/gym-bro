import { Check } from 'lucide-react';
import React from 'react';

import { MULTI_SELECT_CLASSES } from '../constants';
import { MultiSelectOptionProps } from '../types';

import { cn } from '@/utils';

export const MultiSelectOption: React.FC<MultiSelectOptionProps> = ({
  option,
  isSelected,
  onToggle,
}) => {
  return (
    <label
      className={cn(
        MULTI_SELECT_CLASSES.option,
        isSelected && MULTI_SELECT_CLASSES.optionSelected,
      )}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={isSelected}
        onChange={onToggle}
      />
      <div className={cn(
        MULTI_SELECT_CLASSES.checkbox,
        isSelected
          ? MULTI_SELECT_CLASSES.checkboxSelected
          : MULTI_SELECT_CLASSES.checkboxUnselected,
      )}>
        {isSelected && <Check className="w-3 h-3 text-white" />}
      </div>
      <span className={MULTI_SELECT_CLASSES.optionText}>{option.label}</span>
    </label>
  );
};
