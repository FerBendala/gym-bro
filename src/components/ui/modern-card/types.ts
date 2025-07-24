import React from 'react';

export type ModernCardVariant = 'default' | 'success' | 'warning' | 'danger' | 'info';
export type ModernCardPadding = 'sm' | 'md' | 'lg';

export interface ModernCardProps {
  variant?: ModernCardVariant;
  padding?: ModernCardPadding;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isClickable?: boolean;
  isActive?: boolean;
}

export interface ModernCardHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
}

export interface ModernCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export interface ModernCardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export interface ModernStatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export interface ModernExerciseCardProps {
  title: string;
  category: string;
  description?: string;
  lastWorkout?: {
    weight: number;
    reps: number;
    date: string;
  };
  isCompleted?: boolean;
  onStart?: () => void;
  onViewDetails?: () => void;
  className?: string;
} 