import { useEffect, useState } from 'react';

import { DATE_PICKER_DEFAULTS } from '../constants';
import { DatePickerProps, DatePickerState } from '../types';
import { formatDateForInput, isValidDate } from '../utils';

export const useDatePicker = ({
  value,
  onChange,
  disabled = DATE_PICKER_DEFAULTS.DISABLED,
}: DatePickerProps) => {
  const [state, setState] = useState<DatePickerState>({
    showPicker: false,
    inputValue: '',
  });

  // Inicializar valor del input cuando cambia el value prop
  useEffect(() => {
    if (value) {
      setState(prev => ({ ...prev, inputValue: formatDateForInput(value) }));
    } else {
      setState(prev => ({ ...prev, inputValue: '' }));
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setState(prev => ({ ...prev, inputValue: newValue }));

    if (newValue) {
      const date = new Date(newValue);
      if (isValidDate(date)) {
        onChange(date);
      }
    } else {
      onChange(undefined);
    }
  };

  const handleTodayClick = () => {
    const today = new Date();
    onChange(today);
    setState(prev => ({
      ...prev,
      inputValue: formatDateForInput(today),
      showPicker: false,
    }));
  };

  const handleClearClick = () => {
    onChange(undefined);
    setState(prev => ({
      ...prev,
      inputValue: '',
      showPicker: false,
    }));
  };

  return {
    state,
    handlers: {
      handleInputChange,
      handleTodayClick,
      handleClearClick,
    },
    disabled,
  };
};
