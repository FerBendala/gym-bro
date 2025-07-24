import { AdminPanelModal } from '@/components/admin-panel';
import { ModernPage } from '@/components/ui';
import { MODERN_THEME } from '@/constants/modern-theme';
import React from 'react';

interface ModernAdminPanelProps {
  isModal?: boolean;
  onClose: () => void;
}

/**
 * Panel de administración moderno que puede funcionar como modal o página completa
 */
export const ModernAdminPanel: React.FC<ModernAdminPanelProps> = ({
  isModal = false,
  onClose
}) => {
  if (isModal) {
    // Renderizar como modal usando el componente existente
    return <AdminPanelModal onClose={onClose} />;
  }

  // Renderizar como página completa
  return (
    <ModernPage
      title="Configuración"
      subtitle="Gestión de ejercicios y asignaciones"
    >
      <div className="space-y-6">
        {/* Contenido del admin panel sin el modal wrapper */}
        <div className={MODERN_THEME.components.card.base}>
          <AdminPanel onClose={onClose} />
        </div>
      </div>
    </ModernPage>
  );
}; 