import { MODERN_THEME } from '@/constants/theme/index.constants';
import { useActiveTab, useCloseMoreMenu, useNavigateTo, useShowMoreMenu, useToggleMoreMenu } from '@/stores/modern-layout';
import { cn } from '@/utils/functions/style-utils';
import React from 'react';
import { compactNavigationItems, moreMenuItems } from '../constants';
import { ModernNavItem } from '../types';

interface BottomNavigationProps {
  activeTab?: ModernNavItem;
  onTabChange?: (tab: ModernNavItem) => void;
  isNavigationVisible?: boolean;
}

// Componente para renderizar un item en el diseño compacto
const NavItemCompact: React.FC<{
  item: { id: ModernNavItem; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number };
  activeTab: ModernNavItem;
  onTabClick: (tab: ModernNavItem) => void;
}> = ({ item, activeTab, onTabClick }) => {
  const Icon = item.icon;
  const isActive = item.id === activeTab;

  return (
    <button
      key={item.id}
      onClick={() => onTabClick(item.id)}
      className={cn(
        MODERN_THEME.navigation.bottomNavCompact.item,
        isActive ? MODERN_THEME.navigation.bottomNavCompact.active : MODERN_THEME.navigation.bottomNavCompact.inactive,
        MODERN_THEME.touch.tap,
        MODERN_THEME.accessibility.focusRing
      )}
      aria-label={`Ir a ${item.label}`}
      title={item.label}
    >
      <div className="relative">
        <Icon className={cn(
          'w-6 h-6',
          isActive ? 'text-blue-400' : 'text-gray-400'
        )} />
        {item.badge && item.badge > 0 && (
          <span className="absolute -top-2 -right-2 w-5 h-5 text-xs bg-red-500 text-white rounded-full flex items-center justify-center">
            {item.badge > 99 ? '99+' : item.badge.toString()}
          </span>
        )}
      </div>
    </button>
  );
};

// Componente para renderizar un item en el menú "más"
const NavItemMore: React.FC<{
  item: { id: ModernNavItem; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number };
  activeTab: ModernNavItem;
  onTabClick: (tab: ModernNavItem) => void;
}> = ({ item, activeTab, onTabClick }) => {
  const Icon = item.icon;
  const isActive = item.id === activeTab;

  return (
    <button
      key={item.id}
      onClick={() => onTabClick(item.id)}
      className={cn(
        'flex items-center gap-3 w-full py-3 px-4 rounded-full transition-all duration-200 min-h-[48px]',
        isActive ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50',
        MODERN_THEME.touch.tap,
        MODERN_THEME.accessibility.focusRing
      )}
      aria-label={`Ir a ${item.label}`}
    >
      <div className="relative">
        <Icon className={cn(
          'w-5 h-5',
          isActive ? 'text-blue-400' : 'text-gray-400'
        )} />
        {item.badge && item.badge > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 text-xs bg-red-500 text-white rounded-full flex items-center justify-center">
            {item.badge > 9 ? '9+' : item.badge.toString()}
          </span>
        )}
      </div>
      <span className={cn(
        'text-sm font-medium',
        isActive ? 'text-blue-400' : 'text-gray-300'
      )}>
        {item.label}
      </span>
    </button>
  );
};

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab: propActiveTab,
  onTabChange: propOnTabChange,
  isNavigationVisible: propIsNavigationVisible
}) => {
  // Usar selectores individuales del store de Zustand
  const storeActiveTab = useActiveTab();
  const navigateTo = useNavigateTo();
  const toggleMoreMenu = useToggleMoreMenu();
  const closeMoreMenu = useCloseMoreMenu();
  const showMoreMenu = useShowMoreMenu();

  // Priorizar props sobre store
  const activeTab = propActiveTab ?? storeActiveTab;
  const isNavigationVisible = propIsNavigationVisible ?? true;

  // Función para manejar el cambio de tab
  const handleTabChange = (tab: ModernNavItem) => {
    if (tab === 'more') {
      toggleMoreMenu();
    } else {
      closeMoreMenu();
      if (propOnTabChange) {
        propOnTabChange(tab);
      } else {
        navigateTo(tab);
      }
    }
  };

  return (
    <nav className={cn(
      MODERN_THEME.navigation.bottomNavCompact.container,
      isNavigationVisible ? 'translate-y-0' : 'translate-y-full',
      MODERN_THEME.animations.transition.normal
    )}>
      <div className="relative">
        <div className={MODERN_THEME.navigation.bottomNavCompact.grid}>
          {compactNavigationItems.map((item) => (
            <NavItemCompact
              key={item.id}
              item={item}
              activeTab={activeTab}
              onTabClick={handleTabChange}
            />
          ))}
        </div>

        {/* Menú "más" desplegable */}
        {showMoreMenu && (
          <div className={cn(
            'absolute bottom-full mb-2 left-0 right-0 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-4xl shadow-2xl p-4 px-3 z-50',
            MODERN_THEME.animations.dropDown.in
          )}>
            <div className="flex flex-col gap-1">
              {moreMenuItems.map((item) => (
                <NavItemMore
                  key={item.id}
                  item={item}
                  activeTab={activeTab}
                  onTabClick={handleTabChange}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}; 