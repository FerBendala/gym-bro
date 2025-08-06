import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import type { FilterModalProps } from '../types';

import { DateSorting } from './filter-date-sorting';
import { FilterModalFooter } from './filter-modal-footer';
import { FilterModalHeader } from './filter-modal-header';
import { SearchFilters } from './filter-search-filters';

import { useModalOverflow } from '@/hooks';

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  exercises,
  searchTerm,
  selectedExercise,
  selectedCategory,
  dateFrom,
  dateTo,
  sortBy,
  sortOrder,
  onSearchTermChange,
  onSelectedExerciseChange,
  onSelectedCategoryChange,
  onDateFromChange,
  onDateToChange,
  onSortByChange,
  onSortOrderChange,
  onClearFilters,
}) => {
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  // Hook para manejar overflow del body
  useModalOverflow(isOpen);

  // Crear o encontrar el contenedor del portal una sola vez
  useEffect(() => {
    let container = document.getElementById('modal-root');

    if (!container) {
      container = document.createElement('div');
      container.id = 'modal-root';
      document.body.appendChild(container);
    }

    setPortalContainer(container);
  }, []);

  // No renderizar nada si el modal no está abierto o no hay contenedor
  if (!isOpen || !portalContainer) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[80] p-4" onClick={handleBackdropClick}>
      <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 rounded-2xl border border-gray-700/50 shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header del modal */}
        <FilterModalHeader onClose={onClose} />

        {/* Contenido del modal */}
        <div className="overflow-y-auto max-h-[calc(90vh-150px)] p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card de Búsqueda y Selección */}
            <SearchFilters
              exercises={exercises}
              searchTerm={searchTerm}
              selectedExercise={selectedExercise}
              selectedCategory={selectedCategory}
              onSearchTermChange={onSearchTermChange}
              onSelectedExerciseChange={onSelectedExerciseChange}
              onSelectedCategoryChange={onSelectedCategoryChange}
            />

            {/* Card de Fechas y Ordenamiento */}
            <DateSorting
              dateFrom={dateFrom}
              dateTo={dateTo}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onDateFromChange={onDateFromChange}
              onDateToChange={onDateToChange}
              onSortByChange={onSortByChange}
              onSortOrderChange={onSortOrderChange}
            />
          </div>
        </div>

        {/* Footer del modal */}
        <FilterModalFooter
          onClearFilters={onClearFilters}
          onClose={onClose}
        />
      </div>
    </div>
  );

  return createPortal(modalContent, portalContainer);
};
