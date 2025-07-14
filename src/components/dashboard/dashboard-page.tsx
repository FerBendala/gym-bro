import React, { useState } from 'react';
import { LoadingSpinner } from '../loading-spinner';
import { OfflineWarning } from '../offline-warning';
import {
  AdvancedTab,
  BalanceTab,
  DashboardEmptyState,
  DashboardTabNavigation,
  ExercisesTab,
  HistoryTab,
  PredictionsTab,
  TrendsTab
} from './components';
import { DEFAULT_DASHBOARD_TAB } from './constants';
import { useDashboardData } from './hooks';
import type { DashboardTab } from './types';

/**
 * Dashboard como página completa sin modal
 * Optimizado para mobile-first con navegación de tabs moderna
 */
export const DashboardPage: React.FC = () => {
  const { workoutRecords, loading, isOnline } = useDashboardData();
  const [activeTab, setActiveTab] = useState<DashboardTab>(DEFAULT_DASHBOARD_TAB);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-gray-400 text-sm">Cargando dashboard...</p>
      </div>
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
      case 'trends':
        return <TrendsTab records={workoutRecords} />;
      case 'history':
        return <HistoryTab records={workoutRecords} />;
      case 'exercises':
        return <ExercisesTab records={workoutRecords} />;
      case 'advanced':
        return <AdvancedTab records={workoutRecords} />;
      case 'predictions':
        return <PredictionsTab records={workoutRecords} />;
      default:
        return <BalanceTab records={workoutRecords} />;
    }
  };

  return (
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
  );
}; 