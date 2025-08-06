import React from 'react';

interface ExercisesUnknownWarningProps {
  unknownRecordsCount: number;
}

export const ExercisesUnknownWarning: React.FC<ExercisesUnknownWarningProps> = ({
  unknownRecordsCount,
}) => {
  if (unknownRecordsCount === 0) return null;

  return (
    <div className="p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
      <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-yellow-400 rounded-full" />
        <p className="text-sm text-yellow-300">
          <strong>{unknownRecordsCount}</strong> registros no se incluyen en el análisis por falta de información de ejercicio.
        </p>
      </div>
    </div>
  );
};
