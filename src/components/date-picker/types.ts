export interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export interface DatePickerState {
  showPicker: boolean;
  inputValue: string;
} 