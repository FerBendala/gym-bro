import { cn } from '@/utils/functions';

export const OfflineWarning: React.FC = () => {
  return (
    <div className={cn(
      'p-4 rounded-xl border border-yellow-500/20 bg-yellow-500/10',
      'flex items-center space-x-3'
    )}>
      <div className="w-2 h-2 rounded-full bg-yellow-500" />
      <div>
        <p className="text-yellow-400 font-medium">Sin conexión</p>
        <p className="text-yellow-300/70 text-sm">
          Se requiere conexión a internet para exportar datos
        </p>
      </div>
    </div>
  );
}; 