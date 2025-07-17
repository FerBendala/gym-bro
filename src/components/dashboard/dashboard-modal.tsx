import { BarChart3, X } from 'lucide-react';
import React, { useState } from 'react';
import { useModalOverflow } from '../../hooks';
import { LoadingSpinner } from '../loading-spinner';
import { OfflineWarning } from '../offline-warning';
import {
  AdvancedTab,
  BalanceTab,
  DashboardEmptyState,
  ExercisesTab,
  HistoryTab,
  PredictionsTab,
  TrendsTab
} from './components';
import { DEFAULT_DASHBOARD_TAB } from './constants';
import { useDashboardData } from './hooks';
import type { DashboardProps, DashboardTab } from './types';

export const Dashboard: React.FC<DashboardProps> = ({ onClose }) => {
  const { workoutRecords, loading, isOnline } = useDashboardData();
  const [activeTab, setActiveTab] = useState<DashboardTab>(DEFAULT_DASHBOARD_TAB);

  // Hook para manejar overflow del body - el modal siempre está "abierto" cuando se renderiza
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
        {/* Header mejorado con gradiente */}
        <div className="relative bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 border-b border-gray-700/50">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
          <div className="relative p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                {/* Icono del dashboard */}
                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg transform hover:scale-105 transition-transform duration-200">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-1 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    Dashboard Analytics
                  </h3>
                  <p className="text-lg text-blue-300 font-medium mb-2">
                    Análisis completo de tu progreso
                  </p>
                </div>
              </div>

              {/* Botón de cerrar mejorado */}
              <button
                onClick={onClose}
                className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 backdrop-blur-sm border border-gray-600/30 hover:border-gray-500/50 hover:shadow-lg hover:scale-105"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {!isOnline && (
          <div className="bg-yellow-900/20 border-b border-yellow-700 p-4">
            <OfflineWarning message="Sin conexión. Los datos mostrados pueden estar desactualizados." />
          </div>
        )}

        {/* Contenido principal */}
        <div className="overflow-y-auto max-h-[calc(95vh-140px)] p-6 space-y-6">
          {/* Navegación por tabs integrada */}
          <div className="flex space-x-1 bg-gray-800/50 p-1 rounded-lg overflow-x-auto">
            {[
              { id: 'balance', label: 'Balance', icon: '⚖️' },
              { id: 'trends', label: 'Tendencias', icon: '📈' },
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

          <div className="bg-gradient-to-br from-gray-800/30 to-gray-700/30 rounded-xl border border-gray-600/30 p-5 hover:border-gray-500/50 transition-colors duration-200">
            {workoutRecords.length === 0 ? (
              <DashboardEmptyState isOnline={isOnline} />
            ) : (
              (() => {
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
              })()
            )}
          </div>
        </div>

        {/* Footer con gradiente sutil y efecto shimmer */}
        <div className="h-2 bg-gradient-to-r from-blue-500/20 via-purple-500/30 to-blue-500/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse" />
        </div>
      </div>
    </div>
  );
};