import { TrendingUp } from 'lucide-react';
import { STRENGTH_PROGRESS_CONSTANTS } from '../constants';

export const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-12">
      <div className="p-4 bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
        <TrendingUp className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-300 mb-2">
        {STRENGTH_PROGRESS_CONSTANTS.EMPTY_STATE.title}
      </h3>
      <p className="text-gray-500">
        {STRENGTH_PROGRESS_CONSTANTS.EMPTY_STATE.description}
      </p>
    </div>
  );
}; 