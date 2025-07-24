import React from 'react';
import { DashboardPage } from '../components/dashboard/dashboard-page';
import { Page } from '../components/layout';

/**
 * Página de progreso moderna que muestra el dashboard como página completa
 * Sin modal, optimizada para mobile-first
 */
export const ModernProgress: React.FC = () => {
  return (
    <Page
      title="Mi Progreso"
      subtitle="Análisis de rendimiento y mejoras"
    >
      <DashboardPage />
    </Page>
  );
}; 