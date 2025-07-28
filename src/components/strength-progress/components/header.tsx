import { TrendingUp } from 'lucide-react';
import { STRENGTH_PROGRESS_CONSTANTS } from '../constants';

export const Header: React.FC = () => {
  return (
    <div className="flex items-center space-x-3">
      <div className="p-2 bg-blue-600/20 rounded-lg">
        <TrendingUp className="w-6 h-6 text-blue-400" />
      </div>
      <div>
        <h2 className="text-xl font-semibold text-white">
          {STRENGTH_PROGRESS_CONSTANTS.HEADER.title}
        </h2>
        <p className="text-gray-400">
          {STRENGTH_PROGRESS_CONSTANTS.HEADER.description}
        </p>
      </div>
    </div>
  );
}; 