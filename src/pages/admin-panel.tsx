import { AdminPanelModal } from '@/components/admin-panel';
import { Page } from '@/components/layout';
import { MODERN_THEME } from '@/constants/theme';
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
    <Page
      title="Configuración"
      subtitle="Gestión de ejercicios y asignaciones"
    >
      <div className="space-y-6">
        {/* Contenido del admin panel sin el modal wrapper */}
        <div className={MODERN_THEME.components.card.base}>
          <ModernAdminPanel onClose={onClose} />
        </div>
      </div>
    </Page>
  );
}; 