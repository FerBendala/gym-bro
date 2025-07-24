// Exportar el store principal
export { useModernLayoutStore } from './store';

// Exportar tipos
export type { ModernLayoutActions, ModernLayoutState, ModernLayoutStore } from './types';

// Exportar constantes
export { INITIAL_STATE, PERSISTENCE_CONFIG } from './constants';

// Exportar acciones (para testing o uso directo)
export {
  createModernLayoutConfigActions, createModernLayoutNavigationActions,
  createModernLayoutUIActions, createModernLayoutUtilityActions
} from './actions';

// Exportar selectores optimizados
export {
  useActiveTab, useCanGoBack, useConfigActions, useConfigState, useIsNavigationVisible, useNavigationActions, useNavigationHistory, useNavigationState, useNavigationType,
  useShowMoreMenu, useSubtitle, useTitle, useUIActions, useUIState
} from './selectors';
