import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import { createNotificationActions } from './actions';
import type { NotificationStore } from './types';
import { getInitialState, persistenceConfig } from './utils';

// Crear el store de notificaciones
export const useNotificationStore = create<NotificationStore>()(
  devtools(
    persist(
      (set) => ({
        ...getInitialState(),

        // Combinar todas las acciones
        ...createNotificationActions(set),
      }),
      persistenceConfig,
    ),
    {
      name: 'notification-store',
    },
  ),
);
