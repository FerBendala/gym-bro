import { Button } from '@/components/button';
import { CalendarDays } from 'lucide-react';
import React from 'react';

interface DateActionsProps {
  onTodayClick: () => void;
  onClearClick: () => void;
  hasValue: boolean;
  disabled?: boolean;
}

export const DateActions: React.FC<DateActionsProps> = ({
  onTodayClick,
  onClearClick,
  hasValue,
  disabled = false
}) => {
  return (
    <div className="mt-2 flex gap-2">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={onTodayClick}
        disabled={disabled}
      >
        <CalendarDays className="w-3 h-3 mr-2" />
        Hoy ({new Date().toLocaleDateString('es-ES')})
      </Button>

      {hasValue && (
        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={onClearClick}
          className="text-xs px-2 py-1"
          disabled={disabled}
        >
          Limpiar fecha
        </Button>
      )}
    </div>
  );
}; 