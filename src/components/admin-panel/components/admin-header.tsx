import { AlertTriangle, Settings, Wifi, WifiOff, X } from 'lucide-react';
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
        <div className="relative p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              {/* Icono del panel */}
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-200">
                <Settings className="w-6 h-6 text-white" />
              </div>

              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-1 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Administración de Ejercicios
                </h3>
                <p className="text-lg text-blue-300 font-medium mb-2">
                  Gestiona tus ejercicios y asignaciones
                </p>

                {/* Indicador de conexión mejorado */}
                <div className="flex items-center space-x-2">
                  {isOnline ? (
                    <div className="flex items-center space-x-1 text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full border border-green-400/30">
                      <Wifi className="w-3 h-3" />
                      <span>En línea</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1 text-xs text-red-400 bg-red-500/20 px-2 py-1 rounded-full border border-red-400/30">
                      <WifiOff className="w-3 h-3" />
                      <span>Sin conexión</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Botón de cerrar mejorado */}
            {showCloseButton && onClose && (
              <button
                onClick={onClose}
                className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 backdrop-blur-sm border border-gray-600/30 hover:border-gray-500/50 hover:shadow-lg hover:scale-105"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {!isOnline && (
        <div className="bg-yellow-900/20 border-b border-yellow-700 p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <p className="text-yellow-400 text-sm">
              Sin conexión a internet. Las funciones de administración están deshabilitadas.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
