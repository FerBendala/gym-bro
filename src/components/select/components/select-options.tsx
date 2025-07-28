import React from 'react';
import { SelectOptionsProps } from '../types';
import { buildOptionClasses } from '../utils';

export const SelectOptions: React.FC<SelectOptionsProps> = ({ options }) => {
  return (
    <>
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          className={buildOptionClasses(option.disabled)}
        >
          {option.label}
        </option>
      ))}
    </>
  );
}; 