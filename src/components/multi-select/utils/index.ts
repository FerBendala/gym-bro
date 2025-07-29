import { MultiSelectOption } from '../types';

export const getDisplayText = (
  value: string[],
  options: MultiSelectOption[],
  placeholder: string,
): string => {
  if (value.length === 0) return placeholder;
  if (value.length === 1) {
    const option = options.find(opt => opt.value === value[0]);
    return option?.label || '';
  }
  return `${value.length} seleccionadas`;
};

export const toggleOption = (
  optionValue: string,
  currentValue: string[],
): string[] => {
  return currentValue.includes(optionValue)
    ? currentValue.filter(v => v !== optionValue)
    : [...currentValue, optionValue];
};
