import { useAdminStore } from '@/stores/admin-store';
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';
import React from 'react';
import { useAdminDataLoader, useOnlineStatus } from '../../hooks';
import { OfflineWarning } from '../offline-warning';
import { URLPreview } from '../url-preview';
import { AdminContent, AdminTabs } from './components';

/**
 * Panel de administración como página completa sin modal
 * Optimizado para mobile-first con navegación de tabs moderna
 * Usa Zustand para el estado global
 */
export const AdminPanelPage: React.FC = () => {
  const isOnline = useOnlineStatus();
  useAdminDataLoader();

  const {
    activeTab,
    previewUrl,
    setTab,
    setPreviewUrl,
  } = useAdminStore();

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

      {/* Navegación de tabs moderna */}
      <AdminTabs
        activeTab={activeTab}
        onTabChange={setTab}
        isModal={false}
      />

      {/* Contenido de tabs */}
      <AdminContent
        activeTab={activeTab}
        isModal={false}
      />

      {/* Modal de vista previa de URL */}
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