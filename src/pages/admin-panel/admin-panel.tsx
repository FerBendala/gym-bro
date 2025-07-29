import React from 'react';

import { AdminPanelContent } from './components';
import { useAdminPanel } from './hooks';
import type { AdminPanelProps } from './types';

import { Page } from '@/components/layout';
import { MODERN_THEME } from '@/constants/theme';

/**
 * Panel de administración moderno que puede funcionar como modal o página completa
 */
export const AdminPanel: React.FC<AdminPanelProps> = ({
  isModal = false,
  onClose,
}) => {
  const { isOnline, activeTab, previewUrl, setTab, setPreviewUrl } = useAdminPanel();

  if (isModal) {
    return (
      <AdminPanelContent
        isModal={true}
        isOnline={isOnline}
        activeTab={activeTab}
        previewUrl={previewUrl}
        onClose={onClose}
        onTabChange={setTab}
        onPreviewClose={() => setPreviewUrl(null)}
      />
    );
  }

  return (
    <Page
      title="Configuración"
      subtitle="Gestión de ejercicios y asignaciones"
    >
      <div className="space-y-6">
        <div className={MODERN_THEME.components.card.base}>
          <AdminPanelContent
            isModal={false}
            isOnline={isOnline}
            activeTab={activeTab}
            previewUrl={previewUrl}
            onClose={onClose}
            onTabChange={setTab}
            onPreviewClose={() => setPreviewUrl(null)}
          />
        </div>
      </div>
    </Page>
  );
};
