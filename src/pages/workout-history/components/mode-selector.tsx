import React from 'react';

interface ModeSelectorProps {
  currentMode: 'simple' | 'advanced';
  onModeChange: (mode: 'simple' | 'advanced') => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onModeChange,
}) => {
  return (
    <div className="mb-4">
      <label className="text-sm text-gray-400 mb-2 block">Modo de edición</label>
      <div className="flex space-x-2">
        <button
          onClick={() => onModeChange('simple')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentMode === 'simple'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Simple
        </button>
        <button
          onClick={() => onModeChange('advanced')}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentMode === 'advanced'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Series individuales
        </button>
      </div>
    </div>
  );
};
