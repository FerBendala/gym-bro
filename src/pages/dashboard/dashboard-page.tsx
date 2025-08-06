import React, { useEffect, useMemo, useState } from 'react';

import {
  BalanceTab,
  DashboardEmptyState,
  DashboardTabNavigation,
} from './components';
import { DEFAULT_DASHBOARD_TAB } from './constants';
import {
  AdvancedTab,
  ExercisesTab,
  HistoryTab,
} from './content';
import { useDashboardData } from './hooks';
import { DashboardTab } from './types';

import { Page } from '@/components/layout';
import { LoadingSpinner } from '@/components/loading-spinner';
import { OfflineWarning } from '@/components/offline-warning';
import { useNavigationParams } from '@/stores/modern-layout';

/**
 * Dashboard como página completa sin modal
 * Optimizado para mobile-first con navegación de tabs moderna
 */
export const DashboardPage: React.FC = () => {
  const { workoutRecords, loading, isOnline } = useDashboardData();
  const navigationParams = useNavigationParams();

  // Determinar el tab inicial basado en los parámetros de navegación
  const initialTab = useMemo<DashboardTab>(() => {
    return navigationParams.filteredExercise ? 'exercises' : DEFAULT_DASHBOARD_TAB;
  }, [navigationParams.filteredExercise]);

  const [activeTab, setActiveTab] = useState<DashboardTab>(initialTab);

  // Actualizar el tab activo cuando cambien los parámetros de navegación
  useEffect(() => {
    if (navigationParams.filteredExercise) {
      setActiveTab('exercises');
    }
  }, [navigationParams.filteredExercise]);

  if (loading) {
    return (
      <Page
        title="Mi Progreso"
        subtitle="Análisis de rendimiento y mejoras"
      >
        <div className="flex flex-col items-center justify-center py-12">
          <LoadingSpinner size="lg" className="mb-4" />
          <p className="text-gray-400 text-sm">Cargando dashboard...</p>
        </div>
      </Page>
    );
  }

  // Renderizar contenido según el tab activo
  const renderTabContent = () => {
    if (workoutRecords.length === 0) {
      return <DashboardEmptyState isOnline={isOnline} />;
    }

    switch (activeTab) {
      case 'balance':
        return <BalanceTab records={workoutRecords} />;
      case 'history':
        return <HistoryTab records={workoutRecords} />;
      case 'exercises':
        return <ExercisesTab records={workoutRecords} />;
      case 'advanced':
        return <AdvancedTab records={workoutRecords} />;
      default:
        return <BalanceTab records={workoutRecords} />;
    }
  };

  return (
    <Page
      title="Mi Progreso"
      subtitle="Análisis de rendimiento y mejoras"
    >
      <div className="space-y-6">
        {/* Warning de conexión */}
        {!isOnline && (
          <OfflineWarning message="Sin conexión. Los datos mostrados pueden estar desactualizados." />
        )}

        {/* Navegación de tabs moderna */}
        <DashboardTabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Contenido principal */}
        {renderTabContent()}
      </div>
    </Page>
  );
};
