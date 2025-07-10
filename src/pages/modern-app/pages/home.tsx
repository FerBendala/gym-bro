import {
  Activity,
  BarChart,
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  Target,
  TrendingUp,
  Trophy,
  Zap
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader } from '../../../components/card';
import { ExerciseList } from '../../../components/exercise-list';
import { StatCard } from '../../../components/stat-card';
import { InfoTooltip } from '../../../components/tooltip';
import { DAYS } from '../../../constants/days';
import { MODERN_THEME } from '../../../constants/modern-theme';
import type { DayOfWeek } from '../../../interfaces';
import { cn } from '../../../utils/functions/style-utils';

interface ModernHomeProps {
  activeDay: DayOfWeek;
  onDayChange: (day: DayOfWeek) => void;
  onOpenAdmin: () => void;
}

// Íconos para cada día de la semana
const dayIcons: Record<string, any> = {
  'lunes': Target,
  'martes': Activity,
  'miércoles': Zap,
  'jueves': BarChart,
  'viernes': Trophy,
  'sábado': Clock,
  'domingo': CheckCircle
};

// Colores para cada día
const dayColors: Record<string, string> = {
  'lunes': 'from-red-500/80 to-pink-500/80',
  'martes': 'from-blue-500/80 to-cyan-500/80',
  'miércoles': 'from-green-500/80 to-emerald-500/80',
  'jueves': 'from-purple-500/80 to-violet-500/80',
  'viernes': 'from-orange-500/80 to-amber-500/80',
  'sábado': 'from-indigo-500/80 to-blue-500/80',
  'domingo': 'from-teal-500/80 to-green-500/80'
};

// Función utilitaria para validar valores numéricos
const safeNumber = (value: any, defaultValue: number = 0): number => {
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return defaultValue;
  }
  return value;
};

/**
 * Página de inicio rediseñada con estilo Balance Muscular
 * Tarjetas con gradientes, barras de progreso y grid de métricas
 */
export const ModernHome: React.FC<ModernHomeProps> = ({
  activeDay,
  onDayChange,
  onOpenAdmin
}) => {
  const [showDaySelector, setShowDaySelector] = useState(false);

  // Obtener información del día actual
  const dayInfo = useMemo(() => {
    const today = new Date().toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
    const isToday = activeDay === today;
    const dayIndex = DAYS.indexOf(activeDay);
    const formattedDate = new Date().toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    // Calcular progreso semanal (simulado)
    const weekProgress = Math.round(((dayIndex + 1) / 7) * 100);

    return {
      isToday,
      dayIndex,
      formattedDate,
      weekProgress
    };
  }, [activeDay]);

  const Icon = dayIcons[activeDay] || Target;
  const colorGradient = dayColors[activeDay] || 'from-gray-500/80 to-gray-600/80';

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header Principal - Estilo Balance Muscular */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Entrenamientos</h1>
                <p className="text-sm text-gray-400">Gestiona tu rutina diaria</p>
              </div>
            </div>
            {/* Selector de día rediseñado */}
            <div className="relative">
              <button
                onClick={() => setShowDaySelector(!showDaySelector)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 hover:bg-gray-800/70 border border-gray-700/30 rounded-lg transition-all duration-200"
              >
                <span className="text-sm font-medium text-white">
                  {activeDay.charAt(0).toUpperCase() + activeDay.slice(1)}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {showDaySelector && (
                <div className="absolute top-full right-0 mt-2 bg-gray-900/95 backdrop-blur-md border border-gray-700/50 rounded-xl shadow-2xl z-[55] min-w-[200px]">
                  <div className="p-2">
                    {DAYS.map((day, index) => {
                      const isActive = day === activeDay;
                      const isCurrentDay = day === new Date().toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
                      const DayIcon = dayIcons[day] || Target;

                      return (
                        <button
                          key={day}
                          onClick={() => {
                            onDayChange(day);
                            setShowDaySelector(false);
                          }}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200',
                            isActive
                              ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                              : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                          )}
                        >
                          <DayIcon className="w-4 h-4 flex-shrink-0" />
                          <span className="font-medium flex-1 text-left">
                            {day.charAt(0).toUpperCase() + day.slice(1)}
                          </span>
                          <div className="flex items-center space-x-2">
                            {isCurrentDay && (
                              <span className="w-2 h-2 bg-green-500 rounded-full" />
                            )}
                            {isActive && (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Indicadores principales - Estilo Balance Muscular */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Día Actual"
          value={activeDay.charAt(0).toUpperCase() + activeDay.slice(1)}
          icon={Icon}
          variant={dayInfo.isToday ? 'success' : 'primary'}
          tooltip="Día de entrenamiento seleccionado actualmente."
          tooltipPosition="top"
        />
        <StatCard
          title="Progreso Semanal"
          value={`${dayInfo.weekProgress}%`}
          icon={TrendingUp}
          variant={dayInfo.weekProgress >= 70 ? 'success' : dayInfo.weekProgress >= 40 ? 'warning' : 'danger'}
          tooltip="Progreso de la semana basado en el día actual."
          tooltipPosition="top"
        />
        <StatCard
          title="Día del Año"
          value={Math.ceil((new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24)).toString()}
          icon={Calendar}
          variant="indigo"
          tooltip="Número de día del año actual."
          tooltipPosition="top"
        />
        <StatCard
          title="Estado"
          value={dayInfo.isToday ? "Hoy" : "Otro día"}
          icon={dayInfo.isToday ? CheckCircle : Clock}
          variant={dayInfo.isToday ? 'success' : 'warning'}
          tooltip={dayInfo.isToday ? "Es tu día de entrenamiento de hoy" : "Día de entrenamiento diferente al actual"}
          tooltipPosition="top"
        />
      </div>

      {/* Información del Día - Rediseñada */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Icon className="w-5 h-5 mr-2" />
            Información del Día
            <InfoTooltip
              content="Detalles del día de entrenamiento seleccionado con métricas y estado actual."
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className={`relative p-4 sm:p-6 rounded-xl bg-gradient-to-br ${dayInfo.isToday ? 'from-green-900/20 to-emerald-900/20' : 'from-gray-800 to-gray-900'} border ${dayInfo.isToday ? 'border-green-500/30' : 'border-gray-700/30'} hover:border-opacity-40 transition-all duration-200`}>
            {/* Header con ícono y estado */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className={`p-2 sm:p-3 rounded-lg bg-gradient-to-br ${colorGradient}`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm sm:text-base md:text-lg font-semibold text-white truncate">
                    {activeDay.charAt(0).toUpperCase() + activeDay.slice(1)}
                  </h4>
                  <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${dayInfo.isToday ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'}`}>
                      {dayInfo.isToday ? '🎯 Hoy' : '📅 Otro día'}
                    </span>
                    {dayInfo.isToday && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-500 text-white">
                        ¡Entrenar!
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right ml-2 sm:ml-4">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                  {dayInfo.dayIndex + 1}/7
                </div>
                <div className="text-xs text-gray-400">
                  día de semana
                </div>
                <div className="mt-1 sm:mt-2 flex justify-end">
                  {dayInfo.isToday ? (
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                  ) : (
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                  )}
                </div>
              </div>
            </div>

            {/* Barra de progreso semanal */}
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>Progreso de la semana</span>
                <span className="text-gray-300">
                  {dayInfo.weekProgress}% completado
                </span>
              </div>
              <div className="relative h-3 sm:h-4 md:h-6 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`relative h-full bg-gradient-to-r ${colorGradient} transition-all duration-300`}
                  style={{ width: `${Math.min(100, dayInfo.weekProgress)}%` }}
                >
                  <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                  {dayInfo.weekProgress > 15 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-white drop-shadow-sm">
                        {dayInfo.weekProgress}%
                      </span>
                    </div>
                  )}
                </div>
                {dayInfo.weekProgress <= 15 && dayInfo.weekProgress > 0 && (
                  <div className="absolute top-0 left-2 h-full flex items-center">
                    <span className="text-xs font-medium text-white drop-shadow-sm">
                      {dayInfo.weekProgress}%
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Grid de métricas del día */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 mb-4">
              <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                <div className="text-xs text-gray-400 mb-1">Fecha</div>
                <div className="text-sm font-semibold text-white">
                  {new Date().getDate()}/{new Date().getMonth() + 1}
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                <div className="text-xs text-gray-400 mb-1">Día #</div>
                <div className="text-sm font-semibold text-white">
                  {dayInfo.dayIndex + 1}
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-2 sm:p-3 text-center">
                <div className="text-xs text-gray-400 mb-1">Semana</div>
                <div className="text-sm font-semibold text-white">
                  {Math.ceil(new Date().getDate() / 7)}
                </div>
              </div>
            </div>

            {/* Información específica del día */}
            <div className={`${dayInfo.isToday ? 'bg-green-900/20 border-green-500/30' : 'bg-gray-800/50 border-gray-700/30'} border rounded-lg p-3`}>
              <div className="flex items-start gap-2">
                <Calendar className={`w-4 h-4 ${dayInfo.isToday ? 'text-green-400' : 'text-gray-400'} mt-0.5 flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${dayInfo.isToday ? 'text-green-300' : 'text-gray-300'} break-words`}>
                    {dayInfo.isToday
                      ? "¡Es tu día de entrenamiento! Hora de ponerse en forma y alcanzar tus objetivos."
                      : `Día programado: ${activeDay}. Revisa tus ejercicios y prepárate para entrenar.`}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {dayInfo.formattedDate}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navegación Rápida entre Días - Rediseñada */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Navegación Semanal
            <InfoTooltip
              content="Acceso rápido a todos los días de la semana con indicadores visuales del progreso."
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {DAYS.map((day, index) => {
              const isActive = day === activeDay;
              const isToday = day === new Date().toLocaleDateString('es-ES', { weekday: 'long' }).toLowerCase();
              const DayIcon = dayIcons[day] || Target;
              const dayColorGradient = dayColors[day] || 'from-gray-500/80 to-gray-600/80';
              const dayProgress = Math.round(((index + 1) / 7) * 100);

              return (
                <div key={day} className="space-y-2">
                  <button
                    onClick={() => onDayChange(day)}
                    className={cn(
                      'w-full flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200 relative',
                      MODERN_THEME.touch.tap,
                      isActive
                        ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                        : 'bg-gray-800/30 text-gray-400 hover:bg-gray-800/50 hover:text-gray-300'
                    )}
                  >
                    <div className={`p-1.5 rounded-lg bg-gradient-to-br ${isActive ? 'from-blue-500/80 to-cyan-500/80' : dayColorGradient} mb-2`}>
                      <DayIcon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-xs font-medium mb-1">
                      {day.slice(0, 3).toUpperCase()}
                    </span>
                    {isToday && (
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    )}
                    {!isToday && (
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        isActive ? 'bg-blue-400' : 'bg-gray-600'
                      )} />
                    )}
                  </button>

                  {/* Mini barra de progreso para cada día */}
                  <div className="w-full bg-gray-800 rounded-full h-1">
                    <div
                      className={`h-1 rounded-full transition-all duration-300 bg-gradient-to-r ${dayColorGradient}`}
                      style={{ width: `${dayProgress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Lista de ejercicios integrada */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-white flex items-center">
            <Trophy className="w-5 h-5 mr-2" />
            Ejercicios del Día
            <InfoTooltip
              content="Lista completa de ejercicios programados para el día seleccionado."
              position="top"
              className="ml-2"
            />
          </h3>
        </CardHeader>
        <CardContent>
          <ExerciseList
            dayOfWeek={activeDay}
            onOpenAdmin={onOpenAdmin}
          />
        </CardContent>
      </Card>
    </div>
  );
}; 