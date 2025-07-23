import { URLPreview } from '@/components/url-preview';
import { useAdminDataLoader, useModalOverflow, useOnlineStatus } from '@/hooks';
import { useAdminStore } from '@/stores/admin';
import React, { useEffect } from 'react';
import { AdminContent, AdminHeader, AdminTabs } from './components';
import type { AdminPanelProps } from './types';

/**
 * Panel de administración responsive con sistema de tabs
 * Optimizado para móvil con modal bottom-sheet mejorado
 * Usa Zustand para el estado global
 */
export const AdminPanelModal: React.FC<AdminPanelProps> = ({ onClose }) => {
  const isOnline = useOnlineStatus();

  // Hook para manejar overflow del body
  useModalOverflow(true);

  // Hook para cargar datos iniciales
  useAdminDataLoader();

  // Usar selectores específicos para acceder al estado correctamente
  const activeTab = useAdminStore((state) => state.adminPanel.activeTab);
  const previewUrl = useAdminStore((state) => state.adminPanel.previewUrl);
  const setTab = useAdminStore((state) => state.setTab);
  const setPreviewUrl = useAdminStore((state) => state.setPreviewUrl);

  console.log('🎯 AdminPanelModal - Estado del store:', { activeTab, previewUrl });
  console.log('🎯 AdminPanelModal - Tipo de activeTab:', typeof activeTab);
  console.log('🎯 AdminPanelModal - activeTab === undefined:', activeTab === undefined);

  // Log de verificación
  useEffect(() => {
    console.log('🎯 AdminPanelModal - activeTab actualizado:', activeTab);
  }, [activeTab]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden transform transition-all duration-300">
        {/* Header */}
        <AdminHeader
          isOnline={isOnline}
          onClose={onClose}
          showCloseButton={true}
        />

        {/* Tabs Navigation */}
        <AdminTabs
          activeTab={activeTab}
          onTabChange={setTab}
          isModal={true}
        />

        {/* Content */}
        <AdminContent
          activeTab={activeTab}
          isModal={true}
        />

        {/* Footer con gradiente sutil y efecto shimmer */}
        <div className="h-2 bg-gradient-to-r from-blue-500/20 via-purple-500/30 to-blue-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse" />
        </div>
      </div>

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
