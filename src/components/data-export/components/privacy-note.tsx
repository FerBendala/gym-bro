import { EXPORT_INFO } from '../constants';

export const PrivacyNote: React.FC = () => {
  return (
    <div className="text-xs text-gray-500 text-center">
      {EXPORT_INFO.privacyNote}
    </div>
  );
};
