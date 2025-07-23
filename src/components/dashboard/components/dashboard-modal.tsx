import React, { useState } from 'react';
import { useModalOverflow } from '../../../hooks';
import { LoadingSpinner } from '../../loading-spinner';
import { OfflineWarning } from '../../offline-warning';
import { DEFAULT_DASHBOARD_TAB } from '../constants';
import { useDashboardData } from '../hooks/use-dashboard-data';
import type { DashboardProps, DashboardTab } from '../types';
import { DashboardEmptyState } from './dashboard-empty-state';
import { DashboardHeader } from './dashboard-header';
import { DashboardTabs } from './dashboard-tabs';


export const Dashboard: React.FC<DashboardProps> = ({ onClose }) => {
  const { workoutRecords, loading, isOnline } = useDashboardData();
  const [activeTab, setActiveTab] = useState<DashboardTab>(DEFAULT_DASHBOARD_TAB);

  useModalOverflow(true);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (loading) {
    return (
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4"
        onClick={handleBackdropClick}
      >
        <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 shadow-2xl p-8 transform transition-all duration-300">
          <div className="flex flex-col items-center">
            <LoadingSpinner size="lg" className="mb-4" />
            <p className="text-gray-400 text-sm">Cargando dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 shadow-2xl max-w-6xl w-full max-h-[95vh] overflow-hidden transform transition-all duration-300">
        <DashboardHeader onClose={onClose} />

        {!isOnline && (
          <div className="bg-yellow-900/20 border-b border-yellow-700 p-4">
            <OfflineWarning message="Sin conexión. Los datos mostrados pueden estar desactualizados." />
          </div>
        )}

        <div className="overflow-y-auto max-h-[calc(95vh-140px)] p-6 space-y-6">
          {workoutRecords.length === 0 ? (
            <DashboardEmptyState isOnline={isOnline} />
          ) : (
            <DashboardTabs
              records={workoutRecords}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          )}
        </div>

        <div className="h-2 bg-gradient-to-r from-blue-500/20 via-purple-500/30 to-blue-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse" />
        </div>
      </div>
    </div>
  );
}; 