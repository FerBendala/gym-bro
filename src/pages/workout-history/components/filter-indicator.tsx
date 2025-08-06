import React from 'react';

import { Button } from '@/components/button';

interface FilterIndicatorProps {
  hasActiveFilters: boolean;
  displayCount: number;
  totalCount: number;
  onClearFilters: () => void;
}

export const FilterIndicator: React.FC<FilterIndicatorProps> = ({
  hasActiveFilters,
  displayCount,
  totalCount,
  onClearFilters,
}) => {
  if (!hasActiveFilters) return null;

  return (
    <div className="p-3 bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-700/30 rounded-lg mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          <span className="text-sm text-blue-300">
            Filtros activos - Mostrando {displayCount} de {totalCount} entrenamientos
          </span>
        </div>
        <Button
          onClick={onClearFilters}
          variant="ghost"
          size="sm"
          className="text-blue-300 hover:text-white hover:bg-blue-600/20"
        >
          Limpiar
        </Button>
      </div>
    </div>
  );
};
