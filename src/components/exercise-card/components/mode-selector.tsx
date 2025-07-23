import React from 'react';

interface ModeSelectorProps {
  isAdvancedMode: boolean;
  onModeChange: (mode: 'simple' | 'advanced') => void;
}

/**
 * Selector de modo de entrenamiento (simple vs avanzado)
 */
export const ModeSelector: React.FC<ModeSelectorProps> = ({
  isAdvancedMode,
  onModeChange
}) => {
  return (
    <div>
      <label className="text-sm text-gray-400 mb-3 block">Modo de entrenamiento</label>
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={() => onModeChange('simple')}
          className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${!isAdvancedMode
            ? 'bg-blue-600 text-white border border-blue-500 shadow-md'
            : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600/50'
            }`}
        >
          🏃 Registro Rápido
        </button>
        <button
          type="button"
          onClick={() => onModeChange('advanced')}
          className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${isAdvancedMode
            ? 'bg-blue-600 text-white border border-blue-500 shadow-md'
            : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600/50'
            }`}
        >
          ⚡ Series Individuales
        </button>
      </div>
    </div>
  );
}; 