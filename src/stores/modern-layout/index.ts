// Exportar el store principal
export { useModernLayoutStore } from './store';

// Exportar tipos
export type { ModernLayoutState, ModernLayoutActions, ModernLayoutStore } from './types';

// Exportar constantes
export { INITIAL_STATE, PERSISTENCE_CONFIG } from './constants';

// Exportar acciones (para testing o uso directo)
export {
  createModernLayoutNavigationActions,
  createModernLayoutUIActions,
  createModernLayoutConfigActions,
  createModernLayoutUtilityActions,
} from './actions';

// Exportar selectores optimizados
export {
  useNavigationState,
  useNavigationActions,
  useUIState,
  useUIActions,
  useConfigState,
  useConfigActions,
  useActiveTab,
  useNavigationType,
  useShowMoreMenu,
  useIsNavigationVisible,
  useCanGoBack,
} from './selectors'; 