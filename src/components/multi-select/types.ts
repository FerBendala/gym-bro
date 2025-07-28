export interface MultiSelectOption {
  value: string;
  label: string;
}

export interface MultiSelectProps {
  label?: string;
  error?: string;
  options: MultiSelectOption[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export interface MultiSelectLabelProps {
  label: string;
  size: 'sm' | 'md' | 'lg';
  hasError: boolean;
}

export interface MultiSelectButtonProps {
  isOpen: boolean;
  disabled: boolean;
  hasError: boolean;
  size: 'sm' | 'md' | 'lg';
  displayText: string;
  hasValue: boolean;
  onToggle: () => void;
}

export interface MultiSelectDropdownProps {
  isOpen: boolean;
  disabled: boolean;
  options: MultiSelectOption[];
  selectedValues: string[];
  onToggleOption: (value: string) => void;
}

export interface MultiSelectOptionProps {
  option: MultiSelectOption;
  isSelected: boolean;
  onToggle: () => void;
}

export interface MultiSelectErrorProps {
  error: string;
  size: 'sm' | 'md' | 'lg';
} 