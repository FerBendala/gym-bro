import React from 'react';

import { Activity, Dumbbell, Heart, Shield, Triangle, Zap } from 'lucide-react';

import type { ExerciseCategory } from '../types';

interface ExerciseCategoryTabsProps {
  categoriesWithCount: { id: string; name: string; count: number }[];
  selectedCategory: ExerciseCategory;
  onCategoryChange: (category: ExerciseCategory) => void;
  isOnline: boolean;
}

const getCategoryIcon = (categoryId: string) => {
  switch (categoryId) {
    case 'all':
      return <Activity className="w-4 h-4" />;
    case 'piernas':
      return <Zap className="w-4 h-4" />;
    case 'pecho':
      return <Heart className="w-4 h-4" />;
    case 'espalda':
      return <Shield className="w-4 h-4" />;
    case 'brazos':
      return <Dumbbell className="w-4 h-4" />;
    case 'hombros':
      return <Triangle className="w-4 h-4" />;
    case 'core':
      return <Activity className="w-4 h-4" />;
    default:
      return <Activity className="w-4 h-4" />;
  }
};

export const ExerciseCategoryTabs: React.FC<ExerciseCategoryTabsProps> = ({
  categoriesWithCount,
  selectedCategory,
  onCategoryChange,
  isOnline,
}) => {
  return (
    <div className="bg-gray-800 rounded-lg overflow-x-auto h-12">
      <div className="flex space-x-1 px-1.5 min-w-max h-full items-center">
        {categoriesWithCount.map((category) => {
          const isActive = selectedCategory === category.id;

          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              disabled={!isOnline}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap flex items-center space-x-2 h-8 ${isActive
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
            >
              {getCategoryIcon(category.id)}
              <span>{category.name}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive
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
