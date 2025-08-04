import React from 'react';

import { getCategoryIcon } from '@/utils';

interface CategoryFilter {
  id: string;
  name: string;
  count: number;
}

interface ExercisesCategoryFiltersProps {
  categories: CategoryFilter[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export const ExercisesCategoryFilters: React.FC<ExercisesCategoryFiltersProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <div className="bg-gray-800 rounded-lg p-1 overflow-hidden">
      <div className="flex space-x-1 overflow-x-auto scrollbar-none">
        {categories.map((category) => {
          const Icon = getCategoryIcon(category.name);
          const isActive = selectedCategory === category.id;

          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`
                flex-shrink-0 flex items-center justify-center space-x-2 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 min-w-max
                ${isActive
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                }
              `}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="whitespace-nowrap">{category.name}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${isActive
                ? 'bg-white/20 text-white'
                : 'bg-gray-600/50 text-gray-300'
                }`}>
                {category.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
