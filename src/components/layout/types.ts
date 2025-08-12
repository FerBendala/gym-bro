import React from 'react';

// Tipos para la navegación
export type ModernNavItem = 'home' | 'progress' | 'calendar' | 'history' | 'settings' | 'chat' | 'more';
export type NavigationType = 'grid' | 'horizontal' | 'compact' | 'iconsOnly';

export interface LayoutProps {
  children: React.ReactNode;
  activeTab: ModernNavItem;
  onTabChange: (tab: ModernNavItem) => void;
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  showBackButton?: boolean;
  onBackClick?: () => void;
  navigationType?: NavigationType;
  isNavigationVisible?: boolean;
}

export interface NavigationItem {
  id: ModernNavItem;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export interface PageProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  className?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export interface SectionProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
}

export interface NavigationConfig {
  item: string;
  active: string;
  inactive: string;
}
