import React, { useState } from 'react';
import { THEME_CONTAINERS } from '../../constants';
import { LoadingSpinner } from '../loading-spinner';
import { OfflineWarning } from '../offline-warning';
import {
  AdvancedTab,
  BalanceTab,
  DashboardEmptyState,
  DashboardHeader,
  PredictionsTab,
  TrendsTab
} from './components';
import { DEFAULT_DASHBOARD_TAB } from './constants';
import { useDashboardData } from './hooks';
import type { DashboardProps, DashboardTab } from './types';

export const Dashboard: React.FC<DashboardProps> = ({ onClose }) => {
  const { workoutRecords, exercises, loading, isOnline, handleDeleteRecord } = useDashboardData();
  const [activeTab, setActiveTab] = useState<DashboardTab>(DEFAULT_DASHBOARD_TAB);

  if (loading) {
    return (
      <div className={THEME_CONTAINERS.modal.overlay}>
        <div className="bg-gray-900 rounded-lg p-8">
          <div className="flex flex-col items-center">
            <LoadingSpinner size="lg" className="mb-4" />
            <p className="text-gray-400 text-sm">Cargando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={THEME_CONTAINERS.modal.overlay}>
      <div className={THEME_CONTAINERS.modal.container}>
        <DashboardHeader
          timeFilterLabel="Todos los datos"
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onClose={onClose}
        />

        {!isOnline && (
          <OfflineWarning message="Sin conexión. Los datos mostrados pueden estar desactualizados." />
        )}

        <div className={THEME_CONTAINERS.modal.content}>
          <div className="p-6 space-y-6 pb-16 sm:pb-20">
            {workoutRecords.length === 0 ? (
              <DashboardEmptyState isOnline={isOnline} />
            ) : (
              (() => {
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
              })()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};