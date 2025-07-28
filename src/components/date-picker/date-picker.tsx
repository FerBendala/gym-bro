import React from 'react';
import { DateActions, DateDisplay, DateInput } from './components';
import { DATE_PICKER_DEFAULTS } from './constants';
import { useDatePicker } from './hooks';
import { DatePickerProps } from './types';

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label = DATE_PICKER_DEFAULTS.LABEL,
  placeholder = DATE_PICKER_DEFAULTS.PLACEHOLDER,
  className = DATE_PICKER_DEFAULTS.CLASS_NAME,
  disabled = DATE_PICKER_DEFAULTS.DISABLED
}) => {
  const { state, handlers, disabled: isDisabled } = useDatePicker({
    value,
    onChange,
    disabled
  });

  return (
    <div className={`relative ${className}`}>
      <DateInput
        value={state.inputValue}
        onChange={handlers.handleInputChange}
        label={label}
        placeholder={placeholder}
        className={className}
        disabled={isDisabled}
      />

      <DateActions
        onTodayClick={handlers.handleTodayClick}
        onClearClick={handlers.handleClearClick}
        hasValue={!!value}
        disabled={isDisabled}
      />

      {value && <DateDisplay value={value} />}
    </div>
  );
}; 