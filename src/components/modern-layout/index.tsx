import { BarChart3, Calendar, ClipboardList, Dumbbell, Home, Settings, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';
import { MODERN_THEME } from '../../constants/modern-theme';
import { cn } from '../../utils/functions/style-utils';

// Tipos para la navegación
export type ModernNavItem = 'home' | 'progress' | 'calendar' | 'stats' | 'history' | 'settings';

interface ModernLayoutProps {
  children: React.ReactNode;
  activeTab: ModernNavItem;
  onTabChange: (tab: ModernNavItem) => void;
  title?: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

interface NavigationItem {
  id: ModernNavItem;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const navigationItems: NavigationItem[] = [
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
    id: 'stats',
    label: 'Estadísticas',
    icon: BarChart3
  },
  {
    id: 'history',
    label: 'Historial',
    icon: ClipboardList
  },
  {
    id: 'settings',
    label: 'Configurar',
    icon: Settings
  }
];

/**
 * Layout moderno con navegación bottom-sheet
 * Optimizado para móvil con soporte completo para desktop
 */
export const ModernLayout: React.FC<ModernLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  title = 'Gym Tracker',
  subtitle,
  headerActions,
  showBackButton = false,
  onBackClick
}) => {
  const [isNavigationVisible, setIsNavigationVisible] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 relative flex flex-col">
      {/* Top Navigation */}
      <header className={cn(
        MODERN_THEME.navigation.topNav.container,
        MODERN_THEME.animations.transition.normal,
        "sticky top-0 z-50 !pt-0"
      )}>
        <div className={MODERN_THEME.navigation.topNav.content}>
          <div className="flex items-center space-x-2">
            {showBackButton && (
              <button
                onClick={onBackClick}
                className={cn(
                  MODERN_THEME.components.button.base,
                  MODERN_THEME.components.button.variants.ghost,
                  MODERN_THEME.components.button.sizes.sm,
                  MODERN_THEME.touch.minTarget
                )}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}

            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg">
                <Dumbbell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className={cn(
                  MODERN_THEME.navigation.topNav.title,
                  MODERN_THEME.animations.transition.normal
                )}>
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm text-gray-400">{subtitle}</p>
                )}
              </div>
            </div>
          </div>

          {headerActions && (
            <div className={MODERN_THEME.navigation.topNav.actions}>
              {headerActions}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className={cn(
        'min-h-max py-8 grow', // Espacio para header y bottom nav
        MODERN_THEME.layout.container.base,
        MODERN_THEME.responsive.spacing.section
      )}>
        <div className={cn(
          MODERN_THEME.animations.fade.in,
          MODERN_THEME.animations.slide.up
        )}>
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className={cn(
        MODERN_THEME.navigation.bottomNav.container,
        isNavigationVisible ? 'translate-y-0' : 'translate-y-full',
        MODERN_THEME.animations.transition.normal
      )}>
        <div className={MODERN_THEME.navigation.bottomNav.grid}>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  MODERN_THEME.navigation.bottomNav.item,
                  isActive
                    ? MODERN_THEME.navigation.bottomNav.active
                    : MODERN_THEME.navigation.bottomNav.inactive,
                  MODERN_THEME.touch.tap,
                  MODERN_THEME.accessibility.focusRing
                )}
                aria-label={`Ir a ${item.label}`}
              >
                <div className="relative">
                  <Icon className={cn(
                    'w-5 h-5 mb-1',
                    isActive ? 'text-blue-400' : 'text-gray-400'
                  )} />
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Overlay para modales */}
      <div id="modal-root" />
    </div>
  );
};

// Hook para manejar la navegación
export const useModernNavigation = (initialTab: ModernNavItem = 'home') => {
  const [activeTab, setActiveTab] = useState<ModernNavItem>(initialTab);
  const [navigationHistory, setNavigationHistory] = useState<ModernNavItem[]>([initialTab]);

  const navigateTo = (tab: ModernNavItem) => {
    setActiveTab(tab);
    setNavigationHistory(prev => [...prev, tab]);
  };

  const goBack = () => {
    if (navigationHistory.length > 1) {
      const newHistory = navigationHistory.slice(0, -1);
      setNavigationHistory(newHistory);
      setActiveTab(newHistory[newHistory.length - 1]);
      return true;
    }
    return false;
  };

  const canGoBack = navigationHistory.length > 1;

  return {
    activeTab,
    navigateTo,
    goBack,
    canGoBack,
    navigationHistory
  };
};

// Componente para páginas individuales
interface ModernPageProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  className?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export const ModernPage: React.FC<ModernPageProps> = ({
  title,
  subtitle,
  children,
  headerActions,
  className,
  showBackButton = false,
  onBackClick
}) => {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {showBackButton && (
            <button
              onClick={onBackClick}
              className={cn(
                MODERN_THEME.components.button.base,
                MODERN_THEME.components.button.variants.ghost,
                MODERN_THEME.components.button.sizes.sm,
                MODERN_THEME.touch.minTarget
              )}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
          )}

          <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            {subtitle && (
              <p className="text-gray-400 mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        {headerActions && (
          <div className="flex items-center space-x-2">
            {headerActions}
          </div>
        )}
      </div>

      {/* Page Content */}
      <div className={cn(
        MODERN_THEME.animations.fade.in,
        MODERN_THEME.animations.slide.up
      )}>
        {children}
      </div>
    </div>
  );
};

// Componente para secciones dentro de páginas
interface ModernSectionProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
}

export const ModernSection: React.FC<ModernSectionProps> = ({
  title,
  subtitle,
  children,
  className,
  headerActions
}) => {
  return (
    <section className={cn('space-y-4', className)}>
      {(title || headerActions) && (
        <div className="flex items-center justify-between">
          {title && (
            <div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              {subtitle && (
                <p className="text-sm text-gray-400 mt-1">{subtitle}</p>
              )}
            </div>
          )}
          {headerActions && (
            <div className="flex items-center space-x-2">
              {headerActions}
            </div>
          )}
        </div>
      )}

      <div className={MODERN_THEME.animations.fade.in}>
        {children}
      </div>
    </section>
  );
}; 