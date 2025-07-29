// Exportar el store principal
export { useModernLayoutStore } from './store';

// Exportar tipos
export type { ModernLayoutStore } from './types';

// Exportar constantes
export { INITIAL_STATE, PERSISTENCE_CONFIG } from './constants';

// Exportar acciones
export {
  createModernLayoutConfigActions, createModernLayoutNavigationActions,
  createModernLayoutUIActions, createModernLayoutUtilityActions,
} from './actions';

// Exportar selectores individuales
export {
  useActiveTab, useCanGoBack, useClearHistory, useCloseMoreMenu, useConfigActions, useConfigState, useGoBack, useIsNavigationVisible, useNavigateTo,
  // Acciones agrupadas
  useNavigationActions, useNavigationHistory,
  // Selectores compuestos
  useNavigationState, useNavigationType,
  // Acciones individuales
  useSetActiveTab, useSetNavigationType, useSetNavigationVisible, useSetShowBackButton, useSetSubtitle, useSetTitle, useShowBackButton, useShowMoreMenu, useSubtitle, useTitle, useToggleMoreMenu, useUIActions, useUIState,
} from './selectors';
