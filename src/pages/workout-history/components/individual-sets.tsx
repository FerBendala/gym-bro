import { Clock } from 'lucide-react';
import React from 'react';

import { formatNumberToString } from '@/utils';

interface IndividualSetsProps {
  individualSets: { weight: number; reps: number }[];
}

export const IndividualSets: React.FC<IndividualSetsProps> = ({
  individualSets,
}) => {
  return (
    <div className="mb-4">
      <div className="flex items-center mb-3">
        <Clock className="w-4 h-4 text-blue-400 mr-2" />
        <h5 className="text-sm font-medium text-blue-300">Series realizadas</h5>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {individualSets.map((set, index) => (
          <div
            key={index}
            className="rounded-lg p-3 border border-gray-600/30"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Serie {index + 1}</span>
              <span className="text-xs text-gray-400">
                {formatNumberToString(set.weight * set.reps)} kg
              </span>
            </div>
            <div className="text-sm text-white font-medium">
              {formatNumberToString(set.weight)} kg × {set.reps} reps
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
