import React from 'react';
import { SelectFeedbackProps } from '../types';
import { buildErrorClasses, buildHelperClasses } from '../utils';

export const SelectFeedback: React.FC<SelectFeedbackProps> = ({ error, helperText, size }) => {
  if (error) {
    return (
      <p className={buildErrorClasses(size)}>
        {error}
      </p>
    );
  }

  if (helperText) {
    return (
      <p className={buildHelperClasses(size)}>
        {helperText}
      </p>
    );
  }

  return null;
}; 