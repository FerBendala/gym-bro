import { AlertTriangle } from 'lucide-react';
import React from 'react';

import { Card, CardContent, CardHeader } from '@/components/card';

interface FatigueAnalysisProps {
  analysis: {
    fatigueAnalysis: {
      fatigueIndex: number;
      overreachingRisk: string;
      recoveryDays: number;
      recoveryRate: number;
      recoveryScore: number;
      workloadTrend: string;
    };
  };
}

export const FatigueAnalysis: React.FC<FatigueAnalysisProps> = ({ analysis }) => {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-white flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          Análisis de Fatiga
        </h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative p-4 sm:p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/30">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="p-2 sm:p-3 rounded-lg bg-gradient-to-br from-red-500/80 to-orange-500/80">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm sm:text-base md:text-lg font-semibold text-white truncate">
                    Nivel de Fatiga
                  </h4>
                  <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${analysis.fatigueAnalysis.fatigueIndex <= 30 ? 'bg-green-500 text-white' :
                      analysis.fatigueAnalysis.fatigueIndex <= 70 ? 'bg-yellow-500 text-black' :
                        'bg-red-500 text-white'
                    }`}>
                      {analysis.fatigueAnalysis.fatigueIndex <= 30 ? 'Baja' :
                        analysis.fatigueAnalysis.fatigueIndex <= 70 ? 'Moderada' : 'Alta'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right ml-2 sm:ml-4">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                  {Math.round(analysis.fatigueAnalysis.fatigueIndex)}%
                </div>
                <div className="text-xs text-gray-400">índice fatiga</div>
              </div>
            </div>

            {/* Barra de progreso de fatiga */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>Índice: {Math.round(analysis.fatigueAnalysis.fatigueIndex)}%</span>
                <span className="text-gray-300">
                  Riesgo: {analysis.fatigueAnalysis.overreachingRisk}
                </span>
              </div>
              <div className="relative h-6 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="relative h-full bg-gradient-to-r from-red-500/80 to-orange-500/80 transition-all duration-300"
                  style={{ width: `${Math.min(100, analysis.fatigueAnalysis.fatigueIndex)}%` }}
                >
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                  {analysis.fatigueAnalysis.fatigueIndex > 15 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-white drop-shadow-sm">
                        {Math.round(analysis.fatigueAnalysis.fatigueIndex)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Grid de métricas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-4">
              <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                <div className="text-xs text-gray-400 mb-1">Días Descanso</div>
                <div className="text-sm sm:text-lg font-semibold text-white">
                  {analysis.fatigueAnalysis.recoveryDays}
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                <div className="text-xs text-gray-400 mb-1">Tasa Recuperación</div>
                <div className="text-sm sm:text-lg font-semibold text-white">
                  {Math.round(analysis.fatigueAnalysis.recoveryRate)}%
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                <div className="text-xs text-gray-400 mb-1">Score Recuperación</div>
                <div className="text-sm sm:text-lg font-semibold text-white">
                  {Math.round(analysis.fatigueAnalysis.recoveryScore)}
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                <div className="text-xs text-gray-400 mb-1">Tendencia Carga</div>
                <div className="text-sm sm:text-lg font-semibold text-white">
                  {analysis.fatigueAnalysis.workloadTrend}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
