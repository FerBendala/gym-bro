import { AdminContent, AdminHeader, AdminTabs } from '@/components/admin-panel/components';
import { OfflineWarning } from '@/components/offline-warning';
import { URLPreview } from '@/components/url-preview';
import { useModalOverflow } from '@/hooks';
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import React from 'react';
import type { AdminPanelContentProps } from '../types';

/**
 * Contenido principal del panel de administración
 * Maneja tanto modal como página completa
 */
export const AdminPanelContent: React.FC<AdminPanelContentProps> = ({
  isModal,
  isOnline,
  activeTab,
  previewUrl,
  onClose,
  onTabChange,
  onPreviewClose
}) => {
  // Hook para manejar overflow del body solo si es modal
  useModalOverflow(isModal);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && isModal) {
      onClose();
    }
  };

  const content = (
    <div className={isModal ? "bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden transform transition-all duration-300" : "w-full"}>
      {/* Header */}
      <AdminHeader
        isOnline={isOnline}
        onClose={onClose}
        showCloseButton={isModal}
      />

      {/* Tabs Navigation */}
      <AdminTabs
        activeTab={activeTab}
        onTabChange={onTabChange}
        isModal={isModal}
      />

      {/* Content */}
      <AdminContent
        activeTab={activeTab}
        isModal={isModal}
      />

      {/* Footer con gradiente sutil y efecto shimmer */}
      <div className="h-2 bg-gradient-to-r from-blue-500/20 via-purple-500/30 to-blue-500/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse" />
      </div>
    </div>
  );

  if (!isModal) {
    return (
      <div className="space-y-6">
        {/* Header con estado de conexión */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold text-white">Administración de Ejercicios</h2>
            {/* Indicador de conexión */}
            <div className="flex items-center space-x-1">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-xs ${isOnline ? 'text-green-500' : 'text-red-500'}`}>
                {isOnline ? 'En línea' : 'Sin conexión'}
              </span>
            </div>
          </div>
        </div>

        {/* Warning de conexión */}
        {!isOnline && (
          <OfflineWarning
            message="Sin conexión a internet. Las funciones de administración están deshabilitadas."
            icon={AlertTriangle}
            variant="warning"
          />
        )}

        {content}
      </div>
    );
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
          onClose={onPreviewClose}
        />
      )}
    </div>
  );
}; 