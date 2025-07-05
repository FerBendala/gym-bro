/**
 * Interfaces genéricas de UI compartidas en todo el proyecto
 * Tipos reutilizables para componentes de interfaz
 */

export type UIVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost';
export type UISize = 'sm' | 'md' | 'lg' | 'none';

export interface BaseUIProps {
  variant?: UIVariant;
  size?: UISize;
  disabled?: boolean;
  loading?: boolean;
}

export interface ContainerProps {
  variant?: UIVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}

/**
 * Interfaz para opciones de select
 * Reutilizable en Select, Dropdown, Autocomplete, etc.
 */
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

/**
 * Interfaz para grupos de opciones de select
 */
export interface SelectGroup {
  label: string;
  options: SelectOption[];
}

/**
 * Interface genérica para componentes contenedores
 * Usada por Card, Modal, Panel, etc.
 */
export interface ContainerProps extends BaseUIProps {
  children: React.ReactNode;
} 