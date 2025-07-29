import React from 'react';

import { AdminContent, AdminHeader, AdminTabs } from './components';
import { useAdminDataLoader } from './hooks';
import type { AdminPanelProps } from './types';

import { URLPreview } from '@/components/url-preview';
import { useModalOverflow } from '@/hooks';
import { useAdminStore } from '@/stores/admin';
import { useOnlineStatus } from '@/stores/connection';

/**
 * Panel de administración responsive con sistema de tabs
 * Optimizado para móvil con modal bottom-sheet mejorado
 * Usa Zustand para el estado global
 */
export const AdminPanelModal: React.FC<AdminPanelProps> = ({ onClose, isPage = false }) => {
  const isOnline = useOnlineStatus();

  // Hook para manejar overflow del body solo si es modal
  useModalOverflow(!isPage);

  // Hook para cargar datos iniciales
  useAdminDataLoader();

  // Usar selectores específicos para acceder al estado correctamente
  const activeTab = useAdminStore((state) => state.adminPanel.activeTab);
  const previewUrl = useAdminStore((state) => state.adminPanel.previewUrl);
  const setTab = useAdminStore((state) => state.setTab);
  const setPreviewUrl = useAdminStore((state) => state.setPreviewUrl);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isPage) {
      onClose();
    }
  };

  const content = (
    <div className={isPage ? 'w-full' : 'bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden transform transition-all duration-300'}>
      {/* Header */}
      <AdminHeader
        isOnline={isOnline}
        onClose={onClose}
        showCloseButton={!isPage}
      />

      {/* Tabs Navigation */}
      <AdminTabs
        activeTab={activeTab}
        onTabChange={setTab}
        isModal={!isPage}
      />

      {/* Content */}
      <AdminContent
        activeTab={activeTab}
        isModal={!isPage}
      />

      {/* Footer con gradiente sutil y efecto shimmer */}
      <div className="h-2 bg-gradient-to-r from-blue-500/20 via-purple-500/30 to-blue-500/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse" />
      </div>
    </div>
  );

  if (isPage) {
    return content;
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4"
      onClick={handleBackdropClick}
    >
      {content}

      {/* Modal de vista previa completa */}
      {previewUrl && (
        <URLPreview
          url={previewUrl}
          showFullPreview={true}
          onClose={() => setPreviewUrl(null)}
        />
      )}
    </div>
  );
};
