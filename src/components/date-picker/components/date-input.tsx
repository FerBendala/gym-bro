import React from 'react';

import { DATE_PICKER_DEFAULTS } from '../constants';
import { getTodayFormatted } from '../utils';

import { Input } from '@/components/input';

interface DateInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  label = DATE_PICKER_DEFAULTS.LABEL,
  placeholder = DATE_PICKER_DEFAULTS.PLACEHOLDER,
  className = DATE_PICKER_DEFAULTS.CLASS_NAME,
  disabled = DATE_PICKER_DEFAULTS.DISABLED,
}) => {
  const todayStr = getTodayFormatted();

  return (
    <Input
      label={label}
      type="date"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`cursor-pointer ${className}`}
      max={todayStr}
    />
  );
};
