import React, { useState } from 'react';
import { LoadingSpinner } from '../loading-spinner';
import { OfflineWarning } from '../offline-warning';
import {
  AdvancedTab,
  BalanceTab,
  DashboardEmptyState,
  DashboardTabNavigation,
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
  const { workoutRecords, exercises, loading, isOnline, handleDeleteRecord } = useDashboardData();
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
      case 'advanced':
        return <AdvancedTab records={workoutRecords} />;
      case 'predictions':
        return <PredictionsTab records={workoutRecords} />;
      default:
        return <BalanceTab records={workoutRecords} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <DashboardTabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          timeFilterLabel="Todos los datos"
        />

        {!isOnline && (
          <OfflineWarning message="Sin conexión. Los datos mostrados pueden estar desactualizados." />
        )}

        <div className="mt-8">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}; 