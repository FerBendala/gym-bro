import { Dumbbell, Zap } from 'lucide-react';
import React from 'react';

interface ModeSelectorProps {
  isAdvancedMode: boolean;
  onModeChange: (mode: 'simple' | 'advanced') => void;
}

/**
 * Selector compacto de modo de entrenamiento (simple vs avanzado)
 */
export const ModeSelector: React.FC<ModeSelectorProps> = ({
  isAdvancedMode,
  onModeChange,
}) => {
  return (
    <div>
      <label className="text-xs text-gray-400 mb-2 block">Modo de entrenamiento</label>
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={() => onModeChange('simple')}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center space-x-1 ${!isAdvancedMode
            ? 'bg-blue-600 text-white border border-blue-500 shadow-md'
            : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600/50'
            }`}
        >
          <Dumbbell className="w-3 h-3" />
          <span>Registro Rápido</span>
        </button>
        <button
          type="button"
          onClick={() => onModeChange('advanced')}
          className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center space-x-1 ${isAdvancedMode
            ? 'bg-blue-600 text-white border border-blue-500 shadow-md'
            : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600/50'
            }`}
        >
          <Zap className="w-3 h-3" />
          <span>Series Individuales</span>
        </button>
      </div>
    </div>
  );
};
