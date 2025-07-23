import { Scale } from 'lucide-react';
import React from 'react';
import { Card, CardContent, CardHeader } from '../card';
import { InfoTooltip } from '../tooltip';
import { HorizontalBarChart, MetaCategoryCard } from './components';
import { useUpperLowerBalance } from './hooks';
import type { UpperLowerBalanceContentProps } from './types';

const UpperLowerBalanceContent: React.FC<UpperLowerBalanceContentProps> = ({
  upperLowerBalance,
  categoryAnalysis,
  muscleBalance,
  onItemClick
}) => {
  const { metaCategoryData } = useUpperLowerBalance({
    upperLowerBalance,
    categoryAnalysis,
    muscleBalance
  });

  return (
    <div className="space-y-6">
      {/* Gráfico de barras horizontales para balance de meta-categorías */}
      <Card>
        <CardHeader className="pb-4">
          <h3 className="text-base lg:text-lg font-semibold text-white flex items-center">
            <Scale className="w-4 h-4 lg:w-5 lg:h-5 mr-2 flex-shrink-0" />
            <span className="truncate">Balance Tren Superior vs Inferior</span>
            <InfoTooltip
              content="Comparación del volumen de entrenamiento entre tren superior (pecho, espalda, hombros, brazos) e inferior (piernas)"
              position="top"
              className="ml-2 flex-shrink-0"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <HorizontalBarChart
            data={metaCategoryData.map(meta => ({
              name: meta.category,
              value: meta.percentage,
              ideal: meta.idealPercentage,
              color: meta.color
            }))}
            onItemClick={onItemClick}
          />
        </CardContent>
      </Card>

      {/* Grid de métricas por meta-categoría */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 lg:gap-6">
        {metaCategoryData.map((meta) => (
          <MetaCategoryCard
            key={meta.category}
            meta={meta}
            categoryAnalysis={categoryAnalysis}
            muscleBalance={muscleBalance}
          />
        ))}
      </div>
    </div>
  );
};

export { UpperLowerBalanceContent };
