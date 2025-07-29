import { ExternalLink, Globe, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import type { PreviewFullProps } from '../types';

import { PreviewContent } from './preview-content';

import { Button } from '@/components/button';
import { useModalOverflow } from '@/hooks';
import { openURLSafely } from '@/utils';

export const PreviewFull: React.FC<PreviewFullProps> = ({ url, previewData, onClose }) => {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  // Hook para manejar overflow del body - el modal siempre está "abierto" cuando se renderiza
  useModalOverflow(true);

  // Crear o encontrar el contenedor del portal una sola vez
  useEffect(() => {
    let container = document.getElementById('modal-root');

    if (!container) {
      container = document.createElement('div');
      container.id = 'modal-root';
      document.body.appendChild(container);
    }

    setPortalContainer(container);

    // Cleanup: no remover el contenedor ya que puede ser usado por otros modales
    return () => {
      // Solo limpiar si es necesario, pero mantener el contenedor
    };
  }, []);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

  // No renderizar nada si no hay contenedor
  if (!portalContainer) return null;

  const modalContent = (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden transform transition-all duration-300">
        {/* Header mejorado con gradiente */}
        <div className="relative bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 border-b border-gray-700/50">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
          <div className="relative p-6">
            <div className="flex items-start justify-between">
              <div className="flex space-x-4 items-center">
                {/* Icono del preview */}
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-200">
                  <Globe className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-1 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    {previewData.title || 'Vista Previa'}
                  </h3>
                </div>
              </div>

              {/* Botón de cerrar mejorado */}
              <button
                onClick={onClose}
                className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 backdrop-blur-sm border border-gray-600/30 hover:border-gray-500/50 hover:shadow-lg hover:scale-105"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="overflow-y-auto max-h-[calc(95vh-180px)] p-6">
          <div className="bg-gradient-to-br from-gray-800/30 to-gray-700/30 rounded-xl border border-gray-600/30 p-5 hover:border-gray-500/50 transition-colors duration-200">
            <PreviewContent url={url} previewData={previewData} />
          </div>
        </div>

        {/* Footer mejorado */}
        <div className="border-t border-gray-700/50 p-6 bg-gray-800/30">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Haz clic en "Abrir original" para visitar el enlace
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => openURLSafely(url)}
              className="bg-blue-600 hover:bg-blue-700 text-white border-blue-500 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir original
            </Button>
          </div>
        </div>

        {/* Footer con gradiente sutil y efecto shimmer */}
        <div className="h-2 bg-gradient-to-r from-blue-500/20 via-purple-500/30 to-blue-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse" />
        </div>
      </div>
    </div>
  );

  // Usar createPortal para renderizar fuera del flujo normal del DOM
  return createPortal(modalContent, portalContainer);
};
