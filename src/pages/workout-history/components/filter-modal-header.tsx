import { Filter, X } from 'lucide-react';
import React from 'react';

interface FilterModalHeaderProps {
  onClose: () => void;
}

export const FilterModalHeader: React.FC<FilterModalHeaderProps> = ({
  onClose
}) => {
  return (
    <div className="relative bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 border-b border-gray-700/50 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
            <Filter className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Filtros de Historial</h3>
            <p className="text-gray-400">Personaliza la visualización de tus entrenamientos</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}; 