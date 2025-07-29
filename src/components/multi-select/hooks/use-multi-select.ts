import { useRef, useState } from 'react';

import { MultiSelectProps } from '../types';
import { getDisplayText, toggleOption } from '../utils';

export const useMultiSelect = ({
  value = [],
  options,
  onChange,
  placeholder,
  disabled = false,
}: MultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleToggleOption = (optionValue: string) => {
    const newValue = toggleOption(optionValue, value);
    onChange(newValue);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const displayText = getDisplayText(value, options, placeholder || '');

  return {
    isOpen,
    dropdownRef,
    displayText,
    handleToggle,
    handleToggleOption,
    handleClose,
    hasValue: value.length > 0,
  };
};
