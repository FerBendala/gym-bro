import React, { useState } from 'react';
import { LoadingSpinner } from '../loading-spinner';
import { OfflineWarning } from '../offline-warning';
import {
  AdvancedTab,
  BalanceTab,
  DashboardEmptyState,
  ExercisesTab,
  HistoryTab,
  PredictionsTab
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
      <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg overflow-x-auto">
        {[
          { id: 'balance', label: 'Balance', icon: '⚖️' },
          { id: 'history', label: 'Historial', icon: '📊' },
          { id: 'exercises', label: 'Ejercicios', icon: '💪' },
          { id: 'advanced', label: 'Avanzado', icon: '🔬' },
          { id: 'predictions', label: 'Predicciones', icon: '🔮' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as DashboardTab)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${isActive
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Contenido principal */}
      {renderTabContent()}
    </div>
  );
}; 