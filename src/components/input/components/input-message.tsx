import React from 'react';

interface InputMessageProps {
  message: string;
  className?: string;
  type: 'error' | 'helper';
}

/**
 * Subcomponente que renderiza mensajes de error o ayuda
 */
export const InputMessage: React.FC<InputMessageProps> = ({ message, className }) => {
  return (
    <p className={className}>
      {message}
    </p>
  );
};
