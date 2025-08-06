import { Filter, X } from 'lucide-react';
import React from 'react';

interface FilterModalHeaderProps {
  onClose: () => void;
}

export const FilterModalHeader: React.FC<FilterModalHeaderProps> = ({
  onClose,
}) => {
  return (
    <div className="relative bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 border-b border-gray-700/50">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10" />
      <div className="relative p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-white mb-0.5 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent truncate">
                Filtros de Historial
              </h3>
              <p className="text-sm text-blue-300 font-medium truncate">
                Personaliza la visualización de tus entrenamientos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 backdrop-blur-sm border border-gray-600/30 hover:border-gray-500/50 hover:shadow-lg hover:scale-105 flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
