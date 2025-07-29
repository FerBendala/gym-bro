/**
 * Interfaces de UI genéricas y reutilizables
 * Tipos compartidos para componentes de interfaz
 */

export type UIVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
export type UISize = 'sm' | 'md' | 'lg' | 'none';

export interface BaseUIProps {
  variant?: UIVariant;
  size?: UISize;
  disabled?: boolean;
  loading?: boolean;
}

export interface ContainerProps extends BaseUIProps {
  variant?: UIVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface SelectGroup {
  label: string;
  options: SelectOption[];
}
