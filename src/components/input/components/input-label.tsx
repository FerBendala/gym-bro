import React from 'react';

interface InputLabelProps {
  label: string;
  className?: string;
}

/**
 * Subcomponente que renderiza la etiqueta del input
 */
export const InputLabel: React.FC<InputLabelProps> = ({ label, className }) => {
  return (
    <label className={className}>
      {label}
    </label>
  );
};
