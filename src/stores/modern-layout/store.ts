import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

import {
  createModernLayoutConfigActions,
  createModernLayoutNavigationActions,
  createModernLayoutUIActions,
  createModernLayoutUtilityActions,
} from './actions';
import { ModernLayoutStore } from './types';

// Crear el store de modern-layout (sin persistencia temporalmente)
export const useModernLayoutStore = create<ModernLayoutStore>()(
  devtools(
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
    {
      name: 'modern-layout-store',
    },
  ),
);
