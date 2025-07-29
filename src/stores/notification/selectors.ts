import { useNotificationStore } from './store';

// Selectores optimizados
export const useCurrentNotification = () => useNotificationStore((state) => state.current);
export const useNotificationsList = () => useNotificationStore((state) => state.items);

// Hook compatible con el sistema anterior
export const useNotification = () => {
  const { showNotification, hideNotification } = useNotificationStore();
  const notification = useCurrentNotification();

  return {
    notification,
    showNotification,
    hideNotification,
  };
};
