import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { useModalOverflow } from '@/hooks';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
  portalId?: string;
  showBackdrop?: boolean;
  backdropClickToClose?: boolean;
}

/**
 * Modal genérico reutilizable con header ajustado
 */
export const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
  maxWidth = '2xl',
  portalId = 'base-modal-portal',
  showBackdrop = true,
  backdropClickToClose = true,
}) => {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  useModalOverflow(isOpen);

  useEffect(() => {
    let container = document.getElementById(portalId);
    if (!container) {
      container = document.createElement('div');
      container.id = portalId;
      document.body.appendChild(container);
    }
    setPortalContainer(container);
  }, [portalId]);

  if (!isOpen || !portalContainer) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (backdropClickToClose && e.target === e.currentTarget) onClose();
  };

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-6xl',
    '3xl': 'max-w-6xl',
    '4xl': 'max-w-6xl',
    '5xl': 'max-w-6xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-6xl',
  };

  const modalContent = (
    <div
      className={`fixed inset-0 flex items-center justify-center z-[70] p-4 ${showBackdrop ? 'bg-black/60 backdrop-blur-sm' : ''
        }`}
      onClick={handleBackdropClick}
    >
      <div className={`bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 shadow-2xl ${maxWidthClasses[maxWidth]} w-full max-h-[95vh] overflow-hidden transform transition-all duration-300`}>
        {/* Header ajustado */}
        <div className="relative bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 border-b border-gray-700/50">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
          <div className="relative p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {Icon && (
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-white mb-0.5 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent truncate">
                    {title}
                  </h3>
                  {subtitle && (
                    <p className="text-sm text-blue-300 font-medium truncate">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 backdrop-blur-sm border border-gray-600/30 hover:border-gray-500/50 hover:shadow-lg hover:scale-105 flex-shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, portalContainer);
}; 