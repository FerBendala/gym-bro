import React from 'react';
import type { ModernButtonProps } from '../types';
import { LoadingSpinner } from './loading-spinner';

interface ButtonContentProps {
  props: ModernButtonProps;
}

export const ButtonContent: React.FC<ButtonContentProps> = ({ props }) => {
  const { isLoading, leftIcon, rightIcon, children, size = 'md' } = props;

  return (
    <>
      {isLoading && <LoadingSpinner size={size} />}

      {leftIcon && !isLoading && (
        <span className="mr-2 flex-shrink-0">
          {leftIcon}
        </span>
      )}

      <span className="truncate">
        {children}
      </span>

      {rightIcon && (
        <span className="ml-2 flex-shrink-0">
          {rightIcon}
        </span>
      )}
    </>
  );
}; 