import { Calendar, ClipboardList, Home, MoreHorizontal, Settings, TrendingUp } from 'lucide-react';
import { NavigationItem } from './types';

// Elementos principales de navegación
export const navigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'Inicio',
    icon: Home
  },
  {
    id: 'progress',
    label: 'Progreso',
    icon: TrendingUp
  },
  {
    id: 'calendar',
    label: 'Calendario',
    icon: Calendar
  },
  {
    id: 'history',
    label: 'Historial',
    icon: ClipboardList
  },
  {
    id: 'settings',
    label: 'Configuración',
    icon: Settings
  }
];

// Elementos principales para el menú compacto (solo 3 + más)
export const compactNavigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'Inicio',
    icon: Home
  },
  {
    id: 'progress',
    label: 'Progreso',
    icon: TrendingUp
  },
  {
    id: 'calendar',
    label: 'Calendario',
    icon: Calendar
  },
  {
    id: 'more',
    label: 'Más',
    icon: MoreHorizontal
  }
];

// Elementos del menú "más"
export const moreMenuItems: NavigationItem[] = [
  {
    id: 'history',
    label: 'Historial',
    icon: ClipboardList
  },
  {
    id: 'settings',
    label: 'Configuración',
    icon: Settings
  }
];

// Valores por defecto
export const DEFAULT_TITLE = 'Gym Tracker';
export const DEFAULT_NAVIGATION_TYPE = 'grid'; 