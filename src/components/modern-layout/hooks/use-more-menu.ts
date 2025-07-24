import { useEffect, useRef } from 'react';
import { useUIActions, useUIState } from '@/stores/modern-layout';

export const useMoreMenu = () => {
  const { showMoreMenu } = useUIState();
  const { toggleMoreMenu, closeMoreMenu } = useUIActions();
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMoreMenu();
      }
    };

    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreMenu, closeMoreMenu]);

  return {
    showMoreMenu,
    menuRef,
    toggleMoreMenu,
    closeMoreMenu
  };
}; 