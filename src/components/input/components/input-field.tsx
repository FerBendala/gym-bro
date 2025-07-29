import { forwardRef } from 'react';

import type { InputProps } from '../types';

interface InputFieldProps extends Omit<InputProps, 'label' | 'error' | 'helperText'> {
  className?: string;
}

/**
 * Subcomponente que renderiza el campo de entrada
 */
export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(({
  className,
  ...props
}, ref) => {
  return (
    <input
      ref={ref}
      className={className}
      {...props}
    />
  );
});

InputField.displayName = 'InputField';
