import { Activity, Calendar } from 'lucide-react';
import React, { useMemo } from 'react';

import { useTrendsContent } from '../hooks/use-trends-content';
import { EmptyState } from '../shared';

import { Card, CardContent, CardHeader } from '@/components/card';
import type { WorkoutRecord } from '@/interfaces';
import { WeeklyAnalysisChart, WeeklySummaryMetrics } from '.';

interface TrendsContentProps {
  records: WorkoutRecord[];
}

export const TrendsContent: React.FC<TrendsContentProps> = ({ records }) => {
  const { trendsData } = useTrendsContent(records);

  const experienceLevel = useMemo(() => {
    if (records.length < 10) return 'Principiante';
    if (records.length < 30) return 'Intermedio';
    if (records.length < 60) return 'Avanzado';
    return 'Experto';
  }, [records.length]);

  if (records.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="Sin datos de tendencias"
        description="Registra algunos entrenamientos para ver tus patrones temporales"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header informativo para principiantes */}
      {records.length < 20 && (
        <Card className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 border-purple-500/30">
          <CardContent>
            <div className="flex items-start gap-3 p-2">
              <Activity className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-purple-300 mb-1">
                  Análisis adaptado a tu nivel ({experienceLevel})
                </h4>
                <p className="text-xs text-gray-400">
                  Las tendencias se analizan según tu historial de entrenamiento.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Análisis por Día de la Semana */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Análisis por Día de la Semana
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <WeeklyAnalysisChart dailyTrends={trendsData.dailyTrends} />
            <WeeklySummaryMetrics dailyTrends={trendsData.dailyTrends} records={records} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
