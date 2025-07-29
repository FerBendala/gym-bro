import { Filter } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/button';

interface FilterModalFooterProps {
  onClearFilters: () => void;
  onClose: () => void;
}

export const FilterModalFooter: React.FC<FilterModalFooterProps> = ({
  onClearFilters,
  onClose,
}) => {
  return (
    <div className="border-t border-gray-700/50 p-6 bg-gray-800/30">
      <div className="flex items-center justify-between">
        <Button
          onClick={onClearFilters}
          variant="secondary"
          className="bg-red-600/20 hover:bg-red-600/30 border-red-500/30 text-red-300"
        >
          <Filter className="w-4 h-4 mr-2" />
          Limpiar todos los filtros
        </Button>
        <div className="flex space-x-3">
          <Button
            onClick={onClose}
            variant="secondary"
          >
            Cancelar
          </Button>
          <Button
            onClick={onClose}
            variant="primary"
          >
            Aplicar filtros
          </Button>
        </div>
      </div>
    </div>
  );
};
