import { History } from 'lucide-react';
import React from 'react';

export const HistoryEmptyState: React.FC = () => {
  return (
    <div className="text-center py-12">
      <div className="p-4 bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
        <History className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-300 mb-2">
        Sin historial de entrenamientos
      </h3>
      <p className="text-gray-500">
        Registra entrenamientos durante varias semanas para ver tu historial
      </p>
    </div>
  );
}; 