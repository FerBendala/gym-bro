import { Calendar, TrendingDown, TrendingUp } from 'lucide-react';
import React from 'react';

import { WORKOUT_HISTORY_CONSTANTS } from '../constants';
import { getQuickDateRange } from '../utils';

import { Card, CardContent } from '@/components/card';
import { DatePicker } from '@/components/date-picker';
import { Select } from '@/components/select';

interface DateSortingProps {
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  sortBy: 'date' | 'exercise' | 'weight' | 'volume';
  sortOrder: 'asc' | 'desc';
  onDateFromChange: (value: Date | undefined) => void;
  onDateToChange: (value: Date | undefined) => void;
  onSortByChange: (value: 'date' | 'exercise' | 'weight' | 'volume') => void;
  onSortOrderChange: (value: 'asc' | 'desc') => void;
}

export const DateSorting: React.FC<DateSortingProps> = ({
  dateFrom,
  dateTo,
  sortBy,
  sortOrder,
  onDateFromChange,
  onDateToChange,
  onSortByChange,
  onSortOrderChange,
}) => {
  const handleQuickDateFilter = (type: 'week' | 'month') => {
    const { from, to } = getQuickDateRange(type);
    onDateFromChange(from);
    onDateToChange(to);
  };

  return (
    <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/30">
      <CardContent className="p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-indigo-600/20 rounded-lg">
            <Calendar className="w-5 h-5 text-indigo-400" />
          </div>
          <h3 className="text-lg font-semibold text-white">Fechas y Ordenamiento</h3>
        </div>

        <div className="space-y-4">
          {/* Rango de fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Desde
              </label>
              <DatePicker
                value={dateFrom}
                onChange={onDateFromChange}
                className="border-gray-600/50 focus:border-yellow-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Hasta
              </label>
              <DatePicker
                value={dateTo}
                onChange={onDateToChange}
                className="border-gray-600/50 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Ordenamiento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                Ordenar por
              </label>
              <Select
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value as 'date' | 'exercise' | 'weight' | 'volume')}
                options={WORKOUT_HISTORY_CONSTANTS.SORT_OPTIONS}
                className="border-gray-600/50 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                {sortOrder === 'desc' ? <TrendingDown className="w-4 h-4 mr-2" /> : <TrendingUp className="w-4 h-4 mr-2" />}
                Orden
              </label>
              <Select
                value={sortOrder}
                onChange={(e) => onSortOrderChange(e.target.value as 'asc' | 'desc')}
                options={WORKOUT_HISTORY_CONSTANTS.SORT_ORDER_OPTIONS}
                className="border-gray-600/50 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Accesos rápidos de fechas */}
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">
              Filtros rápidos
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleQuickDateFilter('week')}
                className="px-3 py-2 bg-blue-600/20 text-blue-300 rounded-lg text-xs hover:bg-blue-600/30 transition-colors border border-blue-500/30"
              >
                📅 Última semana
              </button>
              <button
                onClick={() => handleQuickDateFilter('month')}
                className="px-3 py-2 bg-green-600/20 text-green-300 rounded-lg text-xs hover:bg-green-600/30 transition-colors border border-green-500/30"
              >
                📆 Último mes
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
