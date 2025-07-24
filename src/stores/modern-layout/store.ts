import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  createModernLayoutConfigActions,
  createModernLayoutNavigationActions,
  createModernLayoutUIActions,
  createModernLayoutUtilityActions,
} from './actions';
import { PERSISTENCE_CONFIG } from './constants';
import { ModernLayoutStore } from './types';

// Crear el store de modern-layout
export const useModernLayoutStore = create<ModernLayoutStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Estado inicial
        activeTab: 'home',
        navigationHistory: ['home'],
        navigationType: 'grid',
        isNavigationVisible: true,
        showMoreMenu: false,
        title: 'Gym Tracker',
        subtitle: undefined,
        showBackButton: false,
        canGoBack: false,

        // Combinar todas las acciones
        ...createModernLayoutNavigationActions(set, get),
        ...createModernLayoutUIActions(set),
        ...createModernLayoutConfigActions(set),
        ...createModernLayoutUtilityActions(set),
      }),
      PERSISTENCE_CONFIG
    ),
    {
      name: 'modern-layout-store',
    }
  )
); 