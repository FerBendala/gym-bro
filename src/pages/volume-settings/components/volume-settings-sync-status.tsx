import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import React from 'react';

import { useSettingsSync } from '@/hooks';
import { formatRelativeTime } from '@/utils/functions/date.utils';

interface VolumeSettingsSyncStatusProps {
  className?: string;
}

export const VolumeSettingsSyncStatus: React.FC<VolumeSettingsSyncStatusProps> = ({ className = '' }) => {
  const { state, syncBidirectional } = useSettingsSync();

  const handleSync = async () => {
    await syncBidirectional();
  };

  const getStatusIcon = () => {
    if (state.syncing) {
      return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
    }
    if (state.error) {
      return <CloudOff className="w-4 h-4 text-red-500" />;
    }
    return <Cloud className="w-4 h-4 text-green-500" />;
  };

  const getStatusText = () => {
    if (state.syncing) {
      return 'Sincronizando...';
    }
    if (state.error) {
      return 'Error de sincronización';
    }
    if (state.lastSync) {
      return `Sincronizado ${formatRelativeTime(new Date(state.lastSync))}`;
    }
    return 'No sincronizado';
  };

  return (
    <div className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg ${className}`}>
      <div className="flex items-center space-x-2">
        {getStatusIcon()}
        <span className="text-sm text-gray-600">{getStatusText()}</span>
      </div>

      <button
        onClick={handleSync}
        disabled={state.syncing}
        className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <RefreshCw className="w-3 h-3" />
        <span>Sincronizar</span>
      </button>
    </div>
  );
};
