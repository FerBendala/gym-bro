import { useEffect, useRef, useState } from 'react';

export const useMoreMenu = () => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false);
      }
    };

    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreMenu]);

  const toggleMoreMenu = () => {
    setShowMoreMenu(!showMoreMenu);
  };

  const closeMoreMenu = () => {
    setShowMoreMenu(false);
  };

  return {
    showMoreMenu,
    menuRef,
    toggleMoreMenu,
    closeMoreMenu
  };
}; 