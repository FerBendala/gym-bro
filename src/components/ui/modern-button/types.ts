import React from 'react';

export type ModernButtonSize = 'sm' | 'md' | 'lg' | 'xl';
export type ModernButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'ghost';

export interface ModernButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ModernButtonVariant;
  size?: ModernButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export interface ModernIconButtonProps extends Omit<ModernButtonProps, 'children'> {
  icon: React.ReactNode;
  'aria-label': string;
}

export interface ModernFloatingButtonProps extends Omit<ModernButtonProps, 'children'> {
  icon: React.ReactNode;
  'aria-label': string;
} 