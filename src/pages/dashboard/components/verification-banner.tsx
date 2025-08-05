import React from 'react';

import { Card, CardContent } from '@/components/card';

interface VerificationBannerProps {
  frequency: number;
  consistency: number;
  intensityScore: number;
}

export const VerificationBanner: React.FC<VerificationBannerProps> = ({
  frequency,
  consistency,
  intensityScore,
}) => {
  const expectedValues = {
    frequency: 4.7,
    consistency: 85,
    intensityScore: 89.3
  };

  const frequencyOk = Math.abs(frequency - expectedValues.frequency) <= 0.5;
  const consistencyOk = Math.abs(consistency - expectedValues.consistency) <= 10;
  const intensityOk = Math.abs(intensityScore - expectedValues.intensityScore) <= 10;

  const allOk = frequencyOk && consistencyOk && intensityOk;

  return (
    <Card className={`border-2 ${allOk ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className={`font-semibold ${allOk ? 'text-green-400' : 'text-red-400'}`}>
              {allOk ? '✅ Mejoras Aplicadas Correctamente' : '⚠️ Problema de Sincronización Detectado'}
            </h4>
            <p className="text-sm text-gray-400 mt-1">
              {allOk ? 'Las métricas reflejan tu realidad de entrenamiento' : 'Los datos no coinciden con las mejoras implementadas'}
            </p>
          </div>
          <div className="text-right text-sm">
            <div className={`${frequencyOk ? 'text-green-400' : 'text-red-400'}`}>
              Frecuencia: {frequency.toFixed(1)} vs {expectedValues.frequency}
            </div>
            <div className={`${consistencyOk ? 'text-green-400' : 'text-red-400'}`}>
              Consistencia: {consistency.toFixed(1)}% vs {expectedValues.consistency}%
            </div>
            <div className={`${intensityOk ? 'text-green-400' : 'text-red-400'}`}>
              Intensidad: {intensityScore.toFixed(1)}% vs {expectedValues.intensityScore}%
            </div>
          </div>
        </div>
        {!allOk && (
          <div className="mt-3 p-3 bg-yellow-900/30 rounded-lg">
            <p className="text-yellow-400 text-sm">
              💡 Solución: Recarga completamente el navegador (Ctrl+F5) para aplicar las mejoras
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 