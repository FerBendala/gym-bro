import { AlertTriangle, Percent } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { Card, CardContent, CardHeader } from '@/components/card';
import { Input } from '@/components/input';

interface CategoryPercentagesInputProps {
  selectedCategories: string[];
  percentages: Record<string, number>;
  onPercentagesChange: (percentages: Record<string, number>) => void;
  disabled?: boolean;
}

export const CategoryPercentagesInput: React.FC<CategoryPercentagesInputProps> = ({
  selectedCategories,
  percentages,
  onPercentagesChange,
  disabled = false,
}) => {
  const [localPercentages, setLocalPercentages] = useState<Record<string, number>>(percentages);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isInitialized = useRef(false);

  // Actualizar porcentajes locales cuando cambian las categorías seleccionadas
  useEffect(() => {
    const newPercentages: Record<string, number> = {};

    selectedCategories.forEach(category => {
      // Mantener el valor existente si está disponible, sino usar 0
      newPercentages[category] = percentages[category] || 0;
    });

    // Si solo hay una categoría, asignar 100%
    if (selectedCategories.length === 1) {
      newPercentages[selectedCategories[0]] = 100;
    }

    setLocalPercentages(newPercentages);

    // Solo llamar a onPercentagesChange en la inicialización o cuando cambian las categorías
    if (selectedCategories.length > 0 && !isInitialized.current) {
      isInitialized.current = true;
      onPercentagesChange(newPercentages);
    }
  }, [selectedCategories, percentages, onPercentagesChange]); // Incluir todas las dependencias

  // Actualizar porcentajes locales cuando cambian los percentages externos (solo en edición)
  useEffect(() => {
    // Solo actualizar si ya está inicializado y los percentages externos son diferentes
    if (isInitialized.current && Object.keys(percentages).length > 0) {
      const currentTotal = Object.values(localPercentages).reduce((sum, val) => sum + val, 0);
      const externalTotal = Object.values(percentages).reduce((sum, val) => sum + val, 0);

      // Solo actualizar si los totals son significativamente diferentes
      if (Math.abs(currentTotal - externalTotal) > 0.1) {
        setLocalPercentages(percentages);
      }
    }
  }, [percentages, localPercentages, onPercentagesChange]);

  const handlePercentageChange = (category: string, value: string) => {
    const numValue = parseFloat(value) || 0;

    const updatedPercentages = {
      ...localPercentages,
      [category]: numValue,
    };

    setLocalPercentages(updatedPercentages);

    // Validar que el porcentaje esté entre 0 y 100
    if (numValue < 0 || numValue > 100) {
      setErrors(prev => ({
        ...prev,
        [category]: 'El porcentaje debe estar entre 0 y 100',
      }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[category];
        return newErrors;
      });

      // Actualizar inmediatamente si no hay errores
      onPercentagesChange(updatedPercentages);
    }
  };

  const calculateTotal = () => {
    return Object.values(localPercentages).reduce((sum, percentage) => sum + percentage, 0);
  };

  const total = calculateTotal();
  const isValidTotal = Math.abs(total - 100) < 0.1; // Permitir pequeñas diferencias por redondeo

  const handleBlur = () => {
    // Solo actualizar si no hay errores y el total es válido
    if (Object.keys(errors).length === 0 && isValidTotal) {
      onPercentagesChange(localPercentages);
    }
  };

  if (selectedCategories.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Percent className="w-4 h-4 text-blue-400" />
          <h4 className="text-sm font-medium text-white">Distribución por Categorías</h4>
        </div>
        <p className="text-xs text-gray-400">
          Asigna porcentajes a cada categoría seleccionada (total debe ser 100%)
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {selectedCategories.map(category => (
            <div key={category} className="flex items-center gap-3">
              <div className="flex-1">
                <Input
                  id={`category-percentage-${category.toLowerCase().replace(/\s+/g, '-')}`}
                  label={category}
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={localPercentages[category] || 0}
                  onChange={(e) => handlePercentageChange(category, e.target.value)}
                  onBlur={handleBlur}
                  disabled={disabled}
                  error={errors[category]}
                  placeholder="0"
                />
              </div>
              <div className="text-sm text-gray-400 w-8 text-center">
                %
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-2 border-t border-gray-700">
            <span className="text-sm font-medium text-white">Total:</span>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${isValidTotal ? 'text-green-400' : 'text-red-400'}`}>
                {total.toFixed(1)}%
              </span>
              {!isValidTotal && (
                <AlertTriangle className="w-4 h-4 text-red-400" />
              )}
            </div>
          </div>

          {!isValidTotal && (
            <div className="text-xs text-red-400 bg-red-900/20 p-2 rounded">
              El total debe ser exactamente 100%. Actual: {total.toFixed(1)}%
            </div>
          )}

          {selectedCategories.length === 1 && (
            <div className="text-xs text-blue-400 bg-blue-900/20 p-2 rounded">
              Con una sola categoría, se asigna automáticamente 100%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
