import { MODERN_THEME } from '@/constants/modern-theme';
import { useActiveTab, useCloseMoreMenu, useNavigateTo, useShowMoreMenu, useToggleMoreMenu } from '@/stores/modern-layout';
import { cn } from '@/utils/functions/style-utils';
import React from 'react';
import { compactNavigationItems, moreMenuItems, navigationItems } from '../constants';
import { ModernNavItem, NavigationItem, NavigationType } from '../types';
import { navigationUtils } from '../utils/navigation-utils';

interface BottomNavigationProps {
  activeTab?: ModernNavItem;
  onTabChange?: (tab: ModernNavItem) => void;
  navigationType?: NavigationType;
  isNavigationVisible?: boolean;
}

// Componente para renderizar un item de navegación estándar
const NavItem: React.FC<{
  item: NavigationItem;
  navConfig: { item: string; active: string; inactive: string };
  activeTab: ModernNavItem;
  onTabClick: (tab: ModernNavItem) => void;
}> = ({ item, navConfig, activeTab, onTabClick }) => {
  const Icon = item.icon;
  const isActive = navigationUtils.isItemActive(item.id, activeTab);

  return (
    <button
      key={item.id}
      onClick={() => onTabClick(item.id)}
      className={cn(
        navigationUtils.getNavItemClasses(isActive, navConfig, `${MODERN_THEME.touch.tap} ${MODERN_THEME.accessibility.focusRing}`)
      )}
      aria-label={`Ir a ${item.label}`}
    >
      <div className="relative">
        <Icon className={cn(
          navigationUtils.getIconClasses(isActive, 'sm'),
          'mb-1'
        )} />
        {item.badge && item.badge > 0 && (
          <span className={navigationUtils.getBadgeClasses('md')}>
            {navigationUtils.formatBadgeNumber(item.badge)}
          </span>
        )}
      </div>
      <span className="text-xs">{item.label}</span>
    </button>
  );
};

// Componente para renderizar un item solo con icono
const NavItemIconOnly: React.FC<{
  item: NavigationItem;
  activeTab: ModernNavItem;
  onTabClick: (tab: ModernNavItem) => void;
}> = ({ item, activeTab, onTabClick }) => {
  const Icon = item.icon;
  const isActive = navigationUtils.isItemActive(item.id, activeTab);

  return (
    <button
      key={item.id}
      onClick={() => onTabClick(item.id)}
      className={cn(
        MODERN_THEME.navigation.bottomNavIconsOnly.item,
        isActive ? MODERN_THEME.navigation.bottomNavIconsOnly.active : MODERN_THEME.navigation.bottomNavIconsOnly.inactive,
        MODERN_THEME.touch.tap,
        MODERN_THEME.accessibility.focusRing
      )}
      aria-label={`Ir a ${item.label}`}
      title={item.label}
    >
      <div className="relative">
        <Icon className={cn(navigationUtils.getIconClasses(isActive, 'md'))} />
        {item.badge && item.badge > 0 && (
          <span className={navigationUtils.getBadgeClasses('sm')}>
            {navigationUtils.formatBadgeNumber(item.badge, 9)}
          </span>
        )}
      </div>
    </button>
  );
};

// Componente para renderizar un item en el diseño compacto
const NavItemCompact: React.FC<{
  item: NavigationItem;
  activeTab: ModernNavItem;
  onTabClick: (tab: ModernNavItem) => void;
}> = ({ item, activeTab, onTabClick }) => {
  const Icon = item.icon;
  const isActive = navigationUtils.isItemActive(item.id, activeTab);

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
        <Icon className={cn(navigationUtils.getIconClasses(isActive, 'md'))} />
        {item.badge && item.badge > 0 && (
          <span className={navigationUtils.getBadgeClasses('md')}>
            {navigationUtils.formatBadgeNumber(item.badge)}
          </span>
        )}
      </div>
    </button>
  );
};

// Componente para renderizar un item en el menú "más"
const NavItemMore: React.FC<{
  item: NavigationItem;
  activeTab: ModernNavItem;
  onTabClick: (tab: ModernNavItem) => void;
}> = ({ item, activeTab, onTabClick }) => {
  const Icon = item.icon;
  const isActive = navigationUtils.isItemActive(item.id, activeTab);

  return (
    <button
      key={item.id}
      onClick={() => onTabClick(item.id)}
      className={cn(
        MODERN_THEME.navigation.moreMenu.item,
        isActive ? MODERN_THEME.navigation.moreMenu.active : MODERN_THEME.navigation.moreMenu.inactive,
        MODERN_THEME.touch.tap,
        MODERN_THEME.accessibility.focusRing
      )}
      aria-label={`Ir a ${item.label}`}
    >
      <div className="relative">
        <Icon className={cn(navigationUtils.getIconClasses(isActive, 'sm'))} />
        {item.badge && item.badge > 0 && (
          <span className={navigationUtils.getBadgeClasses('sm')}>
            {navigationUtils.formatBadgeNumber(item.badge, 9)}
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
  navigationType: propNavigationType,
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
  const navigationType = propNavigationType ?? 'grid';
  const isNavigationVisible = propIsNavigationVisible ?? true;

  // Función para manejar el cambio de tab
  const handleTabChange = (tab: ModernNavItem) => {
    if (propOnTabChange) {
      // Si se proporciona prop, usar callback
      navigationUtils.handleTabChange(tab, propOnTabChange, toggleMoreMenu, closeMoreMenu);
    } else {
      // Si no, usar store
      navigationUtils.handleTabChange(tab, navigateTo, toggleMoreMenu, closeMoreMenu);
    }
  };

  // Función para renderizar la navegación según el tipo
  const renderNavigation = () => {
    // Por defecto usar el diseño compacto
    const items = compactNavigationItems;

    switch (navigationType) {
      case 'horizontal':
        return (
          <div className={MODERN_THEME.navigation.bottomNavHorizontal.scrollContainer}>
            <div className={MODERN_THEME.navigation.bottomNavHorizontal.grid}>
              {navigationItems.map((item) => (
                <NavItem
                  key={item.id}
                  item={item}
                  navConfig={MODERN_THEME.navigation.bottomNavHorizontal}
                  activeTab={activeTab}
                  onTabClick={handleTabChange}
                />
              ))}
            </div>
          </div>
        );

      case 'iconsOnly':
        return (
          <div className={MODERN_THEME.navigation.bottomNavIconsOnly.grid}>
            {navigationItems.map((item) => (
              <NavItemIconOnly
                key={item.id}
                item={item}
                activeTab={activeTab}
                onTabClick={handleTabChange}
              />
            ))}
          </div>
        );

      default: // 'grid' y 'compact' - usar diseño compacto
        return (
          <div className="relative">
            <div className={MODERN_THEME.navigation.bottomNavCompact.grid}>
              {items.map((item) => (
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
                MODERN_THEME.navigation.moreMenu.container,
                'z-40',
                MODERN_THEME.animations.dropDown.in
              )}>
                <div className={MODERN_THEME.navigation.moreMenu.grid}>
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
        );
    }
  };

  return (
    <nav className={cn(
      MODERN_THEME.navigation.bottomNavCompact.container,
      isNavigationVisible ? 'translate-y-0' : 'translate-y-full',
      MODERN_THEME.animations.transition.normal
    )}>
      {renderNavigation()}
    </nav>
  );
}; 