import React from 'react';

import { MULTI_SELECT_CLASSES } from '../constants';
import { MultiSelectDropdownProps } from '../types';

import { MultiSelectOption } from './multi-select-option';

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  isOpen,
  disabled,
  options,
  selectedValues,
  onToggleOption,
}) => {
  if (!isOpen || disabled) return null;

  return (
    <div className={MULTI_SELECT_CLASSES.dropdown}>
      {options.map((option) => {
        const isSelected = selectedValues.includes(option.value);
        return (
          <MultiSelectOption
            key={option.value}
            option={option}
            isSelected={isSelected}
            onToggle={() => onToggleOption(option.value)}
          />
        );
      })}
    </div>
  );
};
