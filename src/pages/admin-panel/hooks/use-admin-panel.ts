import type { AdminPanelHookState } from '../types';

import { useAdminDataLoader } from '@/components/admin-panel/hooks';
import { useAdminStore } from '@/stores/admin';
import { useOnlineStatus } from '@/stores/connection';

/**
 * Hook principal para el panel de administración
 * Centraliza toda la lógica de estado y datos
 */
export const useAdminPanel = (): AdminPanelHookState => {
  const isOnline = useOnlineStatus();

  // Hook para cargar datos iniciales
  useAdminDataLoader();

  // Usar selectores específicos para acceder al estado correctamente
  const activeTab = useAdminStore((state) => state.adminPanel.activeTab);
  const previewUrl = useAdminStore((state) => state.adminPanel.previewUrl);
  const setTab = useAdminStore((state) => state.setTab);
  const setPreviewUrl = useAdminStore((state) => state.setPreviewUrl);

  return {
    isOnline,
    activeTab,
    previewUrl,
    setTab,
    setPreviewUrl,
  };
};
