import { ModernNavItem } from '../types';

export const navigationUtils = {
  // Función para manejar el cambio de tab
  handleTabChange: (
    tab: ModernNavItem,
    onTabChange: (tab: ModernNavItem) => void,
    toggleMoreMenu: () => void,
    closeMoreMenu: () => void
  ) => {
    if (tab === 'more') {
      toggleMoreMenu();
    } else {
      closeMoreMenu();
      onTabChange(tab);
    }
  },

  // Obtener clases CSS para items de navegación
  getNavItemClasses: (
    isActive: boolean,
    navConfig: { item: string; active: string; inactive: string },
    baseClasses: string
  ) => {
    return `${navConfig.item} ${isActive ? navConfig.active : navConfig.inactive} ${baseClasses}`;
  },

  // Obtener clases CSS para iconos
  getIconClasses: (isActive: boolean, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-5 h-5',
      md: 'w-6 h-6',
      lg: 'w-7 h-7'
    };

    return `${sizeClasses[size]} ${isActive ? 'text-blue-400' : 'text-gray-400'}`;
  },

  // Obtener clases CSS para badges
  getBadgeClasses: (size: 'sm' | 'md' = 'md') => {
    const sizeClasses = {
      sm: 'absolute -top-1 -right-1 w-4 h-4 text-xs',
      md: 'absolute -top-2 -right-2 w-5 h-5 text-xs'
    };

    return `${sizeClasses[size]} bg-red-500 text-white rounded-full flex items-center justify-center`;
  },

  // Formatear número de badge
  formatBadgeNumber: (badge: number, maxDisplay: number = 99) => {
    if (badge > maxDisplay) {
      return `${maxDisplay}+`;
    }
    return badge.toString();
  },

  // Verificar si un item está activo
  isItemActive: (itemId: ModernNavItem, activeTab: ModernNavItem) => {
    return itemId === activeTab;
  }
}; 