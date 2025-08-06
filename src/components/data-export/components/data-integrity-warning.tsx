import { AlertTriangle, Info } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { findOrphanedRecords } from '@/utils';

interface DataIntegrityWarningProps {
  className?: string;
}

export const DataIntegrityWarning: React.FC<DataIntegrityWarningProps> = ({ className }) => {
  const [integrityData, setIntegrityData] = useState<{
    orphanedCount: number;
    totalRecords: number;
    percentage: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkDataIntegrity = async () => {
      try {
        setLoading(true);
        const { statistics } = await findOrphanedRecords();

        setIntegrityData({
          orphanedCount: statistics.orphanedCount,
          totalRecords: statistics.totalRecords,
          percentage: ((statistics.validCount / statistics.totalRecords) * 100),
        });
      } catch (error) {
        console.error('Error verificando integridad de datos:', error);
      } finally {
        setLoading(false);
      }
    };

    checkDataIntegrity();
  }, []);

  if (loading) {
    return null;
  }

  if (!integrityData || integrityData.orphanedCount === 0) {
    return null;
  }

  const isCritical = integrityData.percentage < 80;
  const isWarning = integrityData.percentage >= 80 && integrityData.percentage < 95;

  if (!isCritical && !isWarning) {
    return null;
  }

  return (
    <div className={`p-4 rounded-lg border ${isCritical
        ? 'bg-red-500/10 border-red-500/30 text-red-400'
        : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
      } ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">
          {isCritical ? (
            <AlertTriangle className="w-5 h-5 text-red-400" />
          ) : (
            <Info className="w-5 h-5 text-yellow-400" />
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-medium mb-1">
            {isCritical ? 'Problema de Integridad de Datos' : 'Advertencia de Datos'}
          </h4>
          <p className="text-sm opacity-90">
            Se encontraron {integrityData.orphanedCount} registros de entrenamiento
            ({integrityData.totalRecords} total) que no tienen ejercicios asociados.
            Esto puede afectar la precisión de los análisis de exportación.
          </p>
          <p className="text-xs opacity-75 mt-2">
            Porcentaje de datos válidos: {integrityData.percentage.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}; 