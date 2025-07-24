import React from 'react';
import { ButtonContent } from './components';
import { useButtonState } from './hooks';
import type { ModernButtonProps, ModernFloatingButtonProps, ModernIconButtonProps } from './types';
import { getButtonClasses } from './utils';

/**
 * Botón moderno con todas las variantes y estados
 * Optimizado para mobile-first con touch targets adecuados
 */
export const ModernButton: React.FC<ModernButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className,
  disabled,
  ...props
}) => {
  const { isDisabled } = useButtonState({ disabled, isLoading });

  return (
    <button
      className={getButtonClasses(variant, size, fullWidth, isDisabled, className)}
      disabled={isDisabled}
      {...props}
    >
      <ButtonContent
        props={{ variant, size, isLoading, leftIcon, rightIcon, children }}
      />
    </button>
  );
};

// Variantes específicas para casos comunes
export const ModernIconButton: React.FC<ModernIconButtonProps> = ({
  icon,
  className,
  ...props
}) => (
  <ModernButton
    className={`p-2 min-w-0 ${className || ''}`}
    {...props}
  >
    {icon}
  </ModernButton>
);

export const ModernFloatingButton: React.FC<ModernFloatingButtonProps> = ({
  icon,
  className,
  ...props
}) => (
  <ModernButton
    className={getButtonClasses('primary', 'md', false, false, className)}
    style={{
      position: 'fixed',
      bottom: '5rem',
      right: '1rem',
      width: '3.5rem',
      height: '3.5rem',
      borderRadius: '50%',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      zIndex: 30
    }}
    {...props}
  >
    {icon}
  </ModernButton>
); 