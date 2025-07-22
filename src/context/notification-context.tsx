import React, { createContext, useCallback, useContext, useState } from 'react';
import type { ThemeNotificationType } from '../constants/theme';
import type { NotificationState } from '../interfaces';

interface NotificationContextType {
  notification: NotificationState;
  showNotification: (message: string, type: ThemeNotificationType) => void;
  hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: React.ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    message: '',
    type: 'info'
  });

  const showNotification = useCallback((message: string, type: ThemeNotificationType) => {
    // Validar que el tipo sea válido
    const validTypes: ThemeNotificationType[] = ['success', 'error', 'warning', 'info'];
    const validType = validTypes.includes(type) ? type : 'info';

    // Si ya hay una notificación visible, la ocultamos primero
    setNotification(prev => ({ ...prev, show: false }));

    // Pequeño delay para permitir que la animación de salida se complete
    setTimeout(() => {
      setNotification({
        show: true,
        message: message.trim(),
        type: validType
      });
    }, 100);
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, show: false }));
  }, []);

  const value = {
    notification,
    showNotification,
    hideNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};