import { AlertTriangle, Settings, X } from 'lucide-react';
import React from 'react';

interface AdminHeaderProps {
  isOnline: boolean;
  onClose?: () => void;
  showCloseButton?: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  isOnline,
  onClose,
  showCloseButton = false,
}) => {
  return (
    <>
      {/* Header mejorado con gradiente */}
      <div className="relative bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 border-b border-gray-700/50">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
        <div className="relative p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              {/* Icono del panel */}
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg flex-shrink-0">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-xl font-bold text-white mb-0.5 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent truncate">
                  Administración de Ejercicios
                </h3>
                <p className="text-xs sm:text-sm text-blue-300 font-medium truncate hidden sm:block">
                  Gestiona tus ejercicios y asignaciones
                </p>
              </div>
            </div>

            {/* Botón de cerrar mejorado */}
            {showCloseButton && onClose && (
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 backdrop-blur-sm border border-gray-600/30 hover:border-gray-500/50 hover:shadow-lg hover:scale-105 flex-shrink-0"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {!isOnline && (
        <div className="bg-yellow-900/20 border-b border-yellow-700 p-3 sm:p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0" />
            <p className="text-yellow-400 text-xs sm:text-sm">
              Sin conexión a internet. Las funciones de administración están deshabilitadas.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
