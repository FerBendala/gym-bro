import React from 'react';

interface ExerciseCardDescriptionProps {
  description?: string;
  showDescription: boolean;
}

export const ExerciseCardDescription: React.FC<ExerciseCardDescriptionProps> = ({
  description,
  showDescription,
}) => {
  if (!description) return null;

  return (
    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showDescription ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
      <div className="mt-3 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
        <p className="text-sm text-blue-200 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};
