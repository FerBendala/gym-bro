import { useShowMoreMenu, useUIActions } from '@/stores/modern-layout';
import { useEffect, useRef } from 'react';

export const useMoreMenu = () => {
  const showMoreMenu = useShowMoreMenu();
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
  }, [showMoreMenu]); // Removida closeMoreMenu de las dependencias

  return {
    showMoreMenu,
    menuRef,
    toggleMoreMenu,
    closeMoreMenu
  };
}; 