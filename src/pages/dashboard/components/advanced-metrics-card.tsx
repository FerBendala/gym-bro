import { Brain } from 'lucide-react';
import React from 'react';

import { Card, CardContent, CardHeader } from '@/components/card';
import { formatNumberToString } from '@/utils';

interface AdvancedMetricsCardProps {
  balanceRatio: number;
  avgVolume: number;
  volumeVariation: number;
  balanceLevel: string;
}

export const AdvancedMetricsCard: React.FC<AdvancedMetricsCardProps> = ({
  balanceRatio,
  avgVolume,
  volumeVariation,
  balanceLevel,
}) => {
  return (
    <Card className="p-6">
      <CardHeader className="pb-4">
        <h4 className="text-lg font-semibold text-white flex items-center">
          <Brain className="w-5 h-5 mr-2" />
          Métricas Avanzadas
        </h4>
        <p className="text-sm text-gray-400">
          Análisis profundo de tu desarrollo muscular
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Balance de Grupos */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Equilibrio de Grupos</span>
            <span className="text-sm font-medium text-white">{formatNumberToString(balanceRatio, 1)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(Math.max(balanceRatio, 0), 100)}%` }}
            />
          </div>
        </div>

        {/* Volumen Promedio */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Volumen Promedio</span>
            <span className="text-sm font-medium text-white">{formatNumberToString(avgVolume, 0)} kg</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(Math.max(avgVolume / 1000 * 100, 0), 100)}%` }}
            />
          </div>
        </div>

        {/* Variación de Volumen */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Variación de Volumen</span>
            <span className="text-sm font-medium text-white">{formatNumberToString(volumeVariation, 0)} kg</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(Math.max(volumeVariation / 500 * 100, 0), 100)}%` }}
            />
          </div>
        </div>

        {/* Recomendaciones */}
        <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
          <h5 className="text-sm font-medium text-white mb-2">💡 Recomendaciones</h5>
          <div className="space-y-2 text-xs text-gray-400">
            {balanceLevel === 'excellent' && (
              <p>• Mantén tu consistencia actual</p>
            )}
            {balanceLevel === 'good' && (
              <>
                <p>• Enfócate en grupos con menor desarrollo</p>
                <p>• Incrementa la intensidad gradualmente</p>
              </>
            )}
            {balanceLevel === 'unbalanced' && (
              <>
                <p>• Prioriza grupos musculares débiles</p>
                <p>• Ajusta tu frecuencia de entrenamiento</p>
              </>
            )}
            {balanceLevel === 'critical' && (
              <>
                <p>• Revisa completamente tu rutina</p>
                <p>• Considera asesoramiento profesional</p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
