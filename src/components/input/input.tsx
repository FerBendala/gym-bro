import { forwardRef } from 'react';
import { InputField, InputLabel, InputMessage } from './components';
import { useInput } from './hooks';
import type { InputProps } from './types';

/**
 * Componente Input genérico usando sistema de tema
 * Soporta variantes, tamaños y estados de validación consistentes
 * Optimizado para móvil con touch targets apropiados
 */
export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const {
    inputProps,
    classes,
    shouldShowHelper,
    label,
    error,
    helperText,
  } = useInput(props);

  return (
    <div className="space-y-1">
      {label && (
        <InputLabel
          label={label}
          className={classes.label}
        />
      )}

      <InputField
        ref={ref}
        className={classes.input}
        {...inputProps}
      />

      {error && (
        <InputMessage
          message={error}
          className={classes.error}
          type="error"
        />
      )}

      {shouldShowHelper && (
        <InputMessage
          message={helperText!}
          className={classes.helper}
          type="helper"
        />
      )}
    </div>
  );
});

Input.displayName = 'Input'; 