// Exportar el store principal
export { useModernLayoutStore } from './store';

// Exportar tipos
export type { ModernLayoutStore } from './types';

// Exportar constantes
export { INITIAL_STATE, PERSISTENCE_CONFIG } from './constants';

// Exportar acciones
export {
  createModernLayoutNavigationActions,
  createModernLayoutUIActions,
  createModernLayoutConfigActions,
  createModernLayoutUtilityActions,
} from './actions';

// Exportar selectores individuales
export {
  useActiveTab,
  useNavigationHistory,
  useCanGoBack,
  useIsNavigationVisible,
  useShowMoreMenu,
  useNavigationType,
  useTitle,
  useSubtitle,
  useShowBackButton,
  // Acciones individuales
  useSetActiveTab,
  useNavigateTo,
  useGoBack,
  useClearHistory,
  useSetNavigationVisible,
  useToggleMoreMenu,
  useCloseMoreMenu,
  useSetNavigationType,
  useSetTitle,
  useSetSubtitle,
  useSetShowBackButton,
  // Acciones agrupadas
  useNavigationActions,
  useUIActions,
  useConfigActions,
  // Selectores compuestos
  useNavigationState,
  useUIState,
  useConfigState,
} from './selectors';
