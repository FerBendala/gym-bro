import { Zap } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/button';
import { Card, CardContent, CardHeader } from '@/components/card';
import { InfoTooltip } from '@/components/tooltip';

interface CategoryFiltersProps {
  categories: { id: string; name: string; count: number }[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategoryFilters: React.FC<CategoryFiltersProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Zap className="w-5 h-5 mr-2" />
          Filtrar por Categoría
          <InfoTooltip
            content="Filtra los ejercicios por categoría muscular. Los ejercicios con múltiples categorías aparecen en todos los filtros relevantes."
            position="top"
            className="ml-2"
          />
        </h3>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onCategoryChange(category.id)}
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
      </CardContent>
    </Card>
  );
};
