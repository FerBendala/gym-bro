import { MODERN_THEME } from '@/constants/theme';
import { useNotification } from '@/stores/notification-store';
import { RotateCcw, Save } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Button } from '../components/button';
import { Card } from '../components/card';
import { IDEAL_VOLUME_DISTRIBUTION } from '../constants/exercise.constants';
import type { UserSettings } from '../utils/data/indexeddb-types';
import { getItem, updateItem } from '../utils/data/indexeddb-utils';
import { cn } from '../utils/functions';

interface VolumeSettingsProps {
  onBack: () => void;
}

/**
 * Página de configuración de volumen por grupo muscular
 * Permite personalizar los porcentajes ideales de distribución de volumen
 */
export const VolumeSettings: React.FC<VolumeSettingsProps> = ({ onBack }) => {
  const [volumeDistribution, setVolumeDistribution] = useState<Record<string, number>>(IDEAL_VOLUME_DISTRIBUTION);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { showNotification } = useNotification();

  // Cargar configuración actual
  useEffect(() => {
    const loadCurrentSettings = async () => {
      try {
        const result = await getItem<UserSettings>('metadata', 'userSettings');
        if (result.success && result.data?.value?.customVolumeDistribution) {
          setVolumeDistribution(result.data.value.customVolumeDistribution);
        }
      } catch (error) {
        console.error('Error cargando configuración de volumen:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCurrentSettings();
  }, []);

  // Actualizar porcentaje de un grupo muscular
  const handleVolumeChange = (category: string, value: number) => {
    const clampedValue = Math.max(0, Math.min(100, value));
    setVolumeDistribution(prev => ({
      ...prev,
      [category]: clampedValue
    }));
  };

  // Calcular total de porcentajes
  const totalPercentage = Object.values(volumeDistribution).reduce((sum, value) => sum + value, 0);

  // Guardar configuración
  const handleSave = async () => {
    if (Math.abs(totalPercentage - 100) > 0.1) {
      showNotification('La suma de todos los porcentajes debe ser exactamente 100%', 'error');
      return;
    }

    setSaving(true);
    try {
      // Obtener configuración actual o crear una nueva
      const currentResult = await getItem<UserSettings>('metadata', 'userSettings');
      const currentSettings = currentResult.success ? currentResult.data : null;

      const newSettings: UserSettings = {
        key: 'userSettings',
        value: {
          ...currentSettings?.value,
          customVolumeDistribution: volumeDistribution
        },
        updatedAt: Date.now()
      };

      const result = await updateItem<UserSettings>('metadata', newSettings);
      if (result.success) {
        showNotification('Configuración de volumen guardada correctamente', 'success');
        onBack();
      } else {
        throw new Error(result.error || 'Error guardando configuración');
      }
    } catch (error) {
      console.error('Error guardando configuración:', error);
      showNotification('Error al guardar la configuración', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Restablecer valores por defecto
  const handleReset = () => {
    setVolumeDistribution(IDEAL_VOLUME_DISTRIBUTION);
    showNotification('Configuración restablecida a valores por defecto', 'info');
  };

  // Normalizar porcentajes automáticamente
  const handleNormalize = () => {
    if (totalPercentage === 0) return;

    const factor = 100 / totalPercentage;
    const normalized = Object.entries(volumeDistribution).reduce((acc, [key, value]) => {
      acc[key] = Math.round(value * factor * 10) / 10; // Redondear a 1 decimal
      return acc;
    }, {} as Record<string, number>);

    setVolumeDistribution(normalized);
    showNotification('Porcentajes normalizados a 100%', 'info');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-400">Cargando configuración...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={onBack}
          className={cn(
            'p-2 rounded-lg',
            MODERN_THEME.components.button.base,
            MODERN_THEME.touch.tap,
            MODERN_THEME.accessibility.focusRing
          )}
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="text-xl font-bold text-white">Configuración de Volumen</h2>
          <p className="text-gray-400 text-sm">Personaliza la distribución ideal de volumen por grupo muscular</p>
        </div>
      </div>

      {/* Información del total */}
      <Card className={cn(
        'p-4',
        totalPercentage === 100
          ? 'border-green-500/30 bg-green-950/20'
          : totalPercentage > 100
            ? 'border-red-500/30 bg-red-950/20'
            : 'border-yellow-500/30 bg-yellow-950/20'
      )}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-white">Total: {totalPercentage.toFixed(1)}%</h3>
            <p className="text-sm text-gray-400">
              {totalPercentage === 100
                ? 'Distribución correcta'
                : totalPercentage > 100
                  ? 'Excede el 100% - ajusta los valores'
                  : 'Falta para llegar al 100%'
              }
            </p>
          </div>
          {totalPercentage !== 100 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleNormalize}
              className="text-blue-400 border-blue-500/30 hover:bg-blue-950/20"
            >
              Normalizar
            </Button>
          )}
        </div>
      </Card>

      {/* Configuración por grupo muscular */}
      <div className="space-y-4">
        {Object.entries(volumeDistribution).map(([category, percentage]) => {
          const defaultValue = IDEAL_VOLUME_DISTRIBUTION[category] || 0;
          const isModified = Math.abs(percentage - defaultValue) > 0.1;

          return (
            <Card key={category} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-white">{category}</h3>
                  <p className="text-sm text-gray-400">
                    Por defecto: {defaultValue}%
                    {isModified && (
                      <span className="ml-2 text-blue-400">• Modificado</span>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">{percentage.toFixed(1)}%</div>
                </div>
              </div>

              {/* Slider y input */}
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="0.5"
                  value={percentage}
                  onChange={(e) => handleVolumeChange(category, parseFloat(e.target.value))}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  value={percentage}
                  onChange={(e) => handleVolumeChange(category, parseFloat(e.target.value) || 0)}
                  className={cn(
                    'w-20 px-3 py-1 rounded-lg text-center text-white bg-gray-800 border border-gray-600',
                    'focus:border-blue-500 focus:outline-none'
                  )}
                />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Botones de acción */}
      <div className="flex items-center justify-between space-x-4 pt-4">
        <Button
          variant="secondary"
          onClick={handleReset}
          className="flex items-center space-x-2 text-gray-400 border-gray-600 hover:bg-gray-800"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Restablecer</span>
        </Button>

        <Button
          onClick={handleSave}
          disabled={saving || Math.abs(totalPercentage - 100) > 0.1}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Guardando...' : 'Guardar Configuración'}</span>
        </Button>
      </div>

      {/* Información adicional */}
      <Card className="p-4 bg-gray-800/50">
        <h3 className="font-semibold text-white mb-2">💡 Consejos</h3>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• Los porcentajes representan la distribución ideal de volumen de entrenamiento</li>
          <li>• La suma de todos los porcentajes debe ser exactamente 100%</li>
          <li>• Puedes usar el botón "Normalizar" para ajustar automáticamente a 100%</li>
          <li>• Los valores por defecto están basados en principios de anatomía funcional</li>
          <li>• Estos valores afectan el análisis de balance muscular en el dashboard</li>
        </ul>
      </Card>
    </div>
  );
}; 