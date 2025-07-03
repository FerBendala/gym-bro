import { CalendarDays } from 'lucide-react';
import React from 'react';
import { Button } from '../button';
import { Input } from '../input';

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label = 'Fecha',
  placeholder = 'Seleccionar fecha',
  className = '',
  disabled = false
}) => {
  const [showPicker, setShowPicker] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');

  // Formatear fecha para mostrar en el input
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Formatear fecha para mostrar como texto
  const formatDateForDisplay = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calcular la fecha máxima (hoy)
  const todayStr = formatDateForInput(new Date());

  // Inicializar valor del input
  React.useEffect(() => {
    if (value) {
      setInputValue(formatDateForInput(value));
    } else {
      setInputValue('');
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (newValue) {
      const date = new Date(newValue);
      if (!isNaN(date.getTime())) {
        onChange(date);
      }
    } else {
      onChange(undefined);
    }
  };

  const handleTodayClick = () => {
    const today = new Date();
    onChange(today);
    setInputValue(formatDateForInput(today));
    setShowPicker(false);
  };

  const handleClearClick = () => {
    onChange(undefined);
    setInputValue('');
    setShowPicker(false);
  };

  return (
    <div className={`relative ${className}`}>
      <Input
        label={label}
        type="date"
        value={inputValue}
        onChange={handleInputChange}
        placeholder={placeholder}
        disabled={disabled}
        className="cursor-pointer"
        max={todayStr}
      />

      {/* El resto del panel visual se puede ocultar, ya que el calendario nativo se usa */}
      {/* Si quieres dejar el botón Hoy, puedes dejarlo debajo: */}
      <div className="mt-2 flex gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleTodayClick}
          disabled={disabled}
        >
          <CalendarDays className="w-3 h-3 mr-2" />
          Hoy ({new Date().toLocaleDateString('es-ES')})
        </Button>
        {value && (
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleClearClick}
            className="text-xs px-2 py-1"
            disabled={disabled}
          >
            Limpiar fecha
          </Button>
        )}
      </div>
      {value && (
        <div className="pt-2 text-xs text-gray-400">
          Fecha seleccionada: <span className="text-white font-medium">{formatDateForDisplay(value)}</span>
        </div>
      )}
    </div>
  );
}; 