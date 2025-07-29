import { Card, CardContent, CardHeader } from '@/components/card';
import { InfoTooltip } from '@/components/tooltip';
import { DASHBOARD_COLORS, OPTIMIZATION_CATEGORIES, PRIORITY_LABELS } from '@/constants';
import type { OptimizationSuggestion } from '@/interfaces';
import { Brain } from 'lucide-react';
import React from 'react';

interface OptimizationSuggestionsProps {
  suggestions: OptimizationSuggestion[];
}

export const OptimizationSuggestions: React.FC<OptimizationSuggestionsProps> = ({ suggestions }) => {
  const getCategoryStyles = (category: string) => {
    return OPTIMIZATION_CATEGORIES[category as keyof typeof OPTIMIZATION_CATEGORIES] || OPTIMIZATION_CATEGORIES.default;
  };

  const getPriorityBadge = (priority: string) => {
    return DASHBOARD_COLORS.PRIORITY_COLORS[priority as keyof typeof DASHBOARD_COLORS.PRIORITY_COLORS] || DASHBOARD_COLORS.PRIORITY_COLORS.low;
  };

  // Validación de seguridad
  if (!suggestions || !Array.isArray(suggestions)) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Brain className="w-5 h-5 mr-2" />
            Sugerencias de Optimización
            <InfoTooltip
              content="Recomendaciones personalizadas y priorizadas basadas en análisis detallado de tus datos de entrenamiento."
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-center py-4">
            Cargando sugerencias de optimización...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Brain className="w-5 h-5 mr-2" />
          Sugerencias de Optimización
          <InfoTooltip
            content="Recomendaciones personalizadas y priorizadas basadas en análisis detallado de tus datos de entrenamiento."
            position="top"
            className="ml-2"
          />
        </h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {suggestions.length > 0 ? (
            suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`p-3 sm:p-4 border rounded-lg ${getCategoryStyles(suggestion.category)}`}
              >
                <div className="flex items-start space-x-3">
                  <suggestion.icon className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                      <h4 className="font-medium text-sm mb-1 sm:mb-0">{suggestion.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${getPriorityBadge(suggestion.priority)} w-fit`}>
                        {PRIORITY_LABELS[suggestion.priority as keyof typeof PRIORITY_LABELS]}
                      </span>
                    </div>
                    <p className="text-xs opacity-90 mb-2">{suggestion.description}</p>
                    <p className="text-xs font-medium opacity-80">{suggestion.action}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-4">
              Tu entrenamiento está bien optimizado - mantén la consistencia
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 