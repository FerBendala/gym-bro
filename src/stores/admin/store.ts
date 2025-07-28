import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  createCRUDActions,
  createDataActions,
  createFilterActions,
  createLoadingActions,
  createUIActions,
  createUtilityActions,
} from './actions';
import { persistenceConfig } from './persistence';
import type { AdminStore } from './types';
import { getInitialState } from './utils';

// Crear el store del admin
export const useAdminStore = create<AdminStore>()(
  devtools(
    persist(
      (set, get) => {
        const currentDay = getInitialState().adminPanel.selectedDay;
        const initialState = getInitialState();

        const store = {
          ...initialState,
          // Asegurar que selectedDay siempre tenga un valor válido
          adminPanel: {
            ...initialState.adminPanel,
            selectedDay: currentDay,
          },

          // Combinar todas las acciones
          ...createUIActions(set, get),
          ...createLoadingActions(set),
          ...createDataActions(set),
          ...createCRUDActions(set),
          ...createFilterActions(set),
          ...createUtilityActions(set, get),
        };

        return store;
      },
      persistenceConfig
    ),
    {
      name: 'admin-store',
    }
  )
); 