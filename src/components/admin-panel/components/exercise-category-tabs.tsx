import React from 'react';
import { Button } from '../../button';
import type { ExerciseCategory } from '../types';

interface ExerciseCategoryTabsProps {
  categoriesWithCount: Array<{ id: string; name: string; count: number }>;
  selectedCategory: ExerciseCategory;
  onCategoryChange: (category: ExerciseCategory) => void;
  isOnline: boolean;
}

export const ExerciseCategoryTabs: React.FC<ExerciseCategoryTabsProps> = ({
  categoriesWithCount,
  selectedCategory,
  onCategoryChange,
  isOnline
}) => {
  return (
    <div className="flex flex-wrap gap-2">
      {categoriesWithCount.map((category) => (
        <Button
          key={category.id}
          variant={selectedCategory === category.id ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => onCategoryChange(category.id as ExerciseCategory)}
          disabled={!isOnline}
          className="flex items-center space-x-2"
        >
          <span>{category.name}</span>
          <span className={`text-xs px-1.5 py-0.5 rounded-full ${selectedCategory === category.id
            ? 'bg-white/20 text-white'
            : 'bg-gray-600/50 text-gray-300'
            }`}>
            {category.count}
          </span>
        </Button>
      ))}
    </div>
  );
}; 