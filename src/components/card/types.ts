import type { UISize, UIVariant } from '@/interfaces';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: UIVariant;
}

export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
  size?: UISize;
}

export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
  size?: UISize;
} 