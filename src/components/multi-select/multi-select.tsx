import { THEME_SELECT } from '@/constants/theme';
import React from 'react';
import {
  MultiSelectButton,
  MultiSelectDropdown,
  MultiSelectError,
  MultiSelectLabel
} from './components';
import { MULTI_SELECT_CONSTANTS } from './constants';
import { useClickOutside, useMultiSelect } from './hooks';
import { MultiSelectProps } from './types';

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  error,
  options,
  value = MULTI_SELECT_CONSTANTS.DEFAULT_VALUE,
  onChange,
  placeholder = MULTI_SELECT_CONSTANTS.DEFAULT_PLACEHOLDER,
  disabled = MULTI_SELECT_CONSTANTS.DEFAULT_DISABLED,
  size = MULTI_SELECT_CONSTANTS.DEFAULT_SIZE
}) => {
  const {
    isOpen,
    dropdownRef,
    displayText,
    handleToggle,
    handleToggleOption,
    handleClose,
    hasValue
  } = useMultiSelect({
    value,
    options,
    onChange,
    placeholder,
    disabled
  });

  useClickOutside(dropdownRef, handleClose);

  return (
    <div className={THEME_SELECT.container}>
      {label && (
        <MultiSelectLabel
          label={label}
          size={size}
          hasError={!!error}
        />
      )}

      <div className="relative" ref={dropdownRef}>
        <MultiSelectButton
          isOpen={isOpen}
          disabled={disabled}
          hasError={!!error}
          size={size}
          displayText={displayText}
          hasValue={hasValue}
          onToggle={handleToggle}
        />

        <MultiSelectDropdown
          isOpen={isOpen}
          disabled={disabled}
          options={options}
          selectedValues={value}
          onToggleOption={handleToggleOption}
        />
      </div>

      {error && (
        <MultiSelectError
          error={error}
          size={size}
        />
      )}
    </div>
  );
}; 