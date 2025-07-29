import { Card, CardContent, CardHeader } from '@/components/card';
import { DASHBOARD_COLORS } from '@/constants';
import type { PerformanceIndicator } from '@/interfaces';
import { formatNumberToString } from '@/utils';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  CalendarCheck,
  CalendarX,
  CheckCircle,
  Clock,
  Heart,
  Layers,
  LucideProps,
  Shield,
  Target,
  Target as TargetIcon,
  TrendingDown,
  TrendingUp,
  Zap
} from 'lucide-react';
import React from 'react';

interface PerformanceIndicatorsProps {
  indicators: PerformanceIndicator[];
}

export const PerformanceIndicators: React.FC<PerformanceIndicatorsProps> = ({ indicators }) => {
  const getIndicatorStyles = (type: string) => {
    return DASHBOARD_COLORS.INDICATOR_COLORS[type as keyof typeof DASHBOARD_COLORS.INDICATOR_COLORS] || DASHBOARD_COLORS.INDICATOR_COLORS.critical;
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ComponentType<LucideProps>> = {
      'calendar-check': CalendarCheck,
      'calendar': Calendar,
      'calendar-x': CalendarX,
      'trending-up': TrendingUp,
      'trending-down': TrendingDown,
      'zap': Zap,
      'heart': Heart,
      'layers': Layers,
      'target': TargetIcon,
      'activity': Activity,
      'shield': Shield,
      'alert-triangle': AlertTriangle,
      'check-circle': CheckCircle,
      'clock': Clock,
      'bar-chart-3': BarChart3,
      'data': BarChart3 // fallback para datos
    };

    const IconComponent = iconMap[iconName] || BarChart3;
    return <IconComponent className="w-5 h-5" />;
  };

  // Validación de seguridad
  if (!indicators || !Array.isArray(indicators)) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Target className="w-5 h-5 mr-2" />
            Indicadores de Rendimiento
          </h3>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-center py-4">
            Cargando indicadores de rendimiento...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Target className="w-5 h-5 mr-2" />
          Indicadores de Rendimiento
        </h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {indicators.length > 0 ? (
            indicators.map((indicator, index) => (
              <div
                key={index}
                className={`p-3 sm:p-4 border rounded-lg ${getIndicatorStyles(indicator.type)}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    {getIconComponent(indicator.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm">{indicator.title}</h4>
                      {indicator.value && (
                        <span className="text-sm font-bold">
                          {indicator.value.includes('%')
                            ? formatNumberToString(parseFloat(indicator.value), 1) + '%'
                            : indicator.value.includes('kg')
                              ? formatNumberToString(parseFloat(indicator.value), 1) + 'kg'
                              : formatNumberToString(parseFloat(indicator.value), 1)
                          }
                        </span>
                      )}
                    </div>
                    <p className="text-xs opacity-90 mb-2">{indicator.description}</p>
                    {indicator.progress !== undefined && (
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-500 ${indicator.type === 'excellent' ? 'bg-green-500' :
                            indicator.type === 'good' ? 'bg-blue-500' :
                              indicator.type === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                          style={{ width: `${Math.min(100, indicator.progress)}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-4">
              Continúa entrenando para desarrollar indicadores de rendimiento
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 