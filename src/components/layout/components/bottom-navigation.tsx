import { MoreHorizontal, RefreshCw, Send, Trash2, Wifi, WifiOff } from 'lucide-react';
import React, { useState } from 'react';

import { compactNavigationItems, moreMenuItems } from '../constants';
import { ModernNavItem } from '../types';

import { MODERN_THEME } from '@/constants/theme';
import { useActiveTab, useCloseMoreMenu, useNavigateTo, useShowMoreMenu, useToggleMoreMenu } from '@/stores/modern-layout';
import { cn } from '@/utils';

interface BottomNavigationProps {
  activeTab?: ModernNavItem;
  onTabChange?: (tab: ModernNavItem) => void;
  isNavigationVisible?: boolean;
  onChatMessage?: (message: string) => void;
  isChatLoading?: boolean;
  isChatConnected?: boolean;
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
        MODERN_THEME.accessibility.focusRing,
      )}
      aria-label={`Ir a ${item.label}`}
      title={item.label}
    >
      <div className="relative">
        <Icon className={cn(
          'w-6 h-6',
          isActive ? 'text-blue-400' : 'text-gray-400',
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
        MODERN_THEME.accessibility.focusRing,
      )}
      aria-label={`Ir a ${item.label}`}
    >
      <div className="relative">
        <Icon className={cn(
          'w-5 h-5',
          isActive ? 'text-blue-400' : 'text-gray-400',
        )} />
        {item.badge && item.badge > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 text-xs bg-red-500 text-white rounded-full flex items-center justify-center">
            {item.badge > 9 ? '9+' : item.badge.toString()}
          </span>
        )}
      </div>
      <span className={cn(
        'text-sm font-medium',
        isActive ? 'text-blue-400' : 'text-gray-300',
      )}>
        {item.label}
      </span>
    </button>
  );
};

// Componente de input para el chat
const ChatInput: React.FC<{
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  isConnected?: boolean;
}> = ({ onSendMessage, isLoading = false, isConnected = true }) => {
  const [inputValue, setInputValue] = useState('');
  const [showMenu, setShowMenu] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading || !isConnected) return;

    onSendMessage(inputValue.trim());
    setInputValue('');
  };

  const handleClear = () => {
    if ((window as any).handleChatClear) {
      (window as any).handleChatClear();
    }
    setShowMenu(false);
  };

  const handleReconnect = () => {
    if ((window as any).handleChatReconnect) {
      (window as any).handleChatReconnect();
    }
    setShowMenu(false);
  };

  // Ajustar altura del textarea automáticamente
  const adjustTextareaHeight = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    element.style.height = Math.min(element.scrollHeight, 120) + 'px';
  };

  // Cerrar menú al hacer clic fuera
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.chat-menu-container')) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div className="flex items-center space-x-3 w-full">
      <div className="flex-1 relative flex items-center">
        <textarea
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            adjustTextareaHeight(e.target);
          }}
          placeholder="Pregunta lo que quieras..."
          disabled={isLoading || !isConnected}
          className="w-full h-full px-4 py-3 bg-transparent text-white placeholder-gray-400 focus:outline-none disabled:opacity-50 resize-none min-h-[48px] max-h-[120px]"
          rows={1}
          style={{
            minHeight: '48px',
            maxHeight: '120px',
            lineHeight: '1.2'
          }}
        />
      </div>

      <button
        type="submit"
        onClick={handleSubmit}
        disabled={isLoading || !isConnected || !inputValue.trim()}
        className="flex-shrink-0 p-3 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 rounded-full transition-colors"
        aria-label="Enviar mensaje"
      >
        <Send className="w-4 h-4 text-white" />
      </button>

      {/* Menú de puntos suspensivos */}
      <div className="relative chat-menu-container">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-3 rounded-full hover:bg-gray-700/50 transition-colors"
          aria-label="Menú de opciones"
        >
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </button>

        {/* Menú desplegable */}
        {showMenu && (
          <div className="absolute bottom-full right-0 mb-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
            <div className="py-1">
              <button
                onClick={handleClear}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-3" />
                Limpiar chat
              </button>
              <button
                onClick={handleReconnect}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-3" />
                Reconectar
              </button>
              <div className="flex items-center px-4 py-2 text-sm">
                <div className="mr-3">
                  {isConnected ? (
                    <Wifi className="w-4 h-4 text-green-500" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <span className={isConnected ? 'text-green-500' : 'text-red-500'}>
                  {isConnected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab: propActiveTab,
  onTabChange: propOnTabChange,
  isNavigationVisible: propIsNavigationVisible,
  onChatMessage,
  isChatLoading = false,
  isChatConnected = true,
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

  // Función para manejar el envío de mensajes del chat
  const handleChatMessage = (message: string) => {
    // Usar la función global del chat si está disponible
    if ((window as any).sendChatMessage) {
      (window as any).sendChatMessage(message);
    } else if (onChatMessage) {
      onChatMessage(message);
    }
  };

  // Obtener el estado del chat desde la función global
  const chatLoading = (window as any).chatLoading || isChatLoading;
  const chatConnected = (window as any).chatConnected !== undefined ? (window as any).chatConnected : isChatConnected;

  // Si estamos en la página del chat, mostrar input
  if (activeTab === 'chat') {
    return (
      <nav className={cn(
        MODERN_THEME.navigation.bottomNavCompact.container,
        isNavigationVisible ? 'translate-y-0' : 'translate-y-full',
        MODERN_THEME.animations.transition.normal,
      )}>
        <div className="relative">
          <div className="p-4">
            <ChatInput
              onSendMessage={handleChatMessage}
              isLoading={chatLoading}
              isConnected={chatConnected}
            />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={cn(
      MODERN_THEME.navigation.bottomNavCompact.container,
      isNavigationVisible ? 'translate-y-0' : 'translate-y-full',
      MODERN_THEME.animations.transition.normal,
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
            MODERN_THEME.animations.dropDown.in,
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
