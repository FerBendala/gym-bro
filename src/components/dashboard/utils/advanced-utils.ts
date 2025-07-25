import type { WorkoutRecord } from '@/interfaces';

export const calculateAdvancedAnalysis = (records: WorkoutRecord[]) => {
  if (records.length === 0) {
    return {
      fatigueAnalysis: {
        fatigueIndex: 0,
        overreachingRisk: 'Bajo',
        recoveryDays: 0,
        recoveryRate: 0,
        recoveryScore: 0,
        workloadTrend: 'Estable',
        stressFactors: { volumeStress: 0, frequencyStress: 0 },
        predictedRecoveryTime: 0,
        fatigueHistory: { trend: 'Estable', consistency: 0 },
        volumeDropIndicators: false,
        recoveryRecommendations: []
      },
      progressPrediction: {
        nextWeekWeight: 0,
        monthlyGrowthRate: 0,
        plateauRisk: 0,
        trendAnalysis: 'estable'
      },
      intensityMetrics: {
        averageIntensity: 0,
        volumeIntensity: 0,
        frequencyIntensity: 0,
        overallIntensity: 'Baja'
      },
      periodComparisons: [],
      trainingEfficiency: {
        timeEfficiencyScore: 0
      },
      trainingDensity: []
    };
  }

  // Calcular fatiga básica
  const totalVolume = records.reduce((sum, r) => sum + (r.weight * r.reps * r.sets), 0);
  const avgWeight = records.reduce((sum, r) => sum + r.weight, 0) / records.length;
  const workoutDays = new Set(records.map(r => r.date.toDateString())).size;

  // Calcular índice de fatiga basado en volumen y frecuencia
  const volumeStress = Math.min(100, (totalVolume / 10000) * 100);
  const frequencyStress = Math.min(100, (workoutDays / 7) * 100);
  const fatigueIndex = Math.min(100, (volumeStress + frequencyStress) / 2);

  // Determinar riesgo de sobreentrenamiento
  let overreachingRisk: 'Bajo' | 'Medio' | 'Alto' = 'Bajo';
  if (fatigueIndex > 70) overreachingRisk = 'Alto';
  else if (fatigueIndex > 40) overreachingRisk = 'Medio';

  // Calcular días de recuperación (días sin entrenar en la última semana)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const recentRecords = records.filter(r => r.date >= weekAgo);
  const recentWorkoutDays = new Set(recentRecords.map(r => r.date.toDateString())).size;
  const recoveryDays = 7 - recentWorkoutDays;

  // Calcular tasa de recuperación
  const recoveryRate = Math.max(0, 100 - fatigueIndex);
  const recoveryScore = Math.max(0, 100 - (fatigueIndex * 1.2));

  // Predicciones básicas
  const nextWeekWeight = avgWeight * 1.02; // 2% de mejora estimada
  const monthlyGrowthRate = 5; // 5kg por mes estimado
  const plateauRisk = Math.min(100, fatigueIndex * 0.8);

  // Análisis de intensidad
  const averageIntensity = Math.min(100, (avgWeight / 100) * 100);
  const volumeIntensity = Math.min(100, (totalVolume / 5000) * 100);
  const frequencyIntensity = Math.min(100, (workoutDays / 5) * 100);

  let overallIntensity: 'Baja' | 'Óptima' | 'Alta' | 'Excesiva' = 'Baja';
  const intensityScore = (averageIntensity + volumeIntensity + frequencyIntensity) / 3;
  if (intensityScore > 80) overallIntensity = 'Excesiva';
  else if (intensityScore > 60) overallIntensity = 'Alta';
  else if (intensityScore > 40) overallIntensity = 'Óptima';

  // Comparaciones de períodos
  const periodComparisons = [
    {
      periodName: 'Último mes',
      improvement: 10, // 10% de mejora estimada
      volumeChange: 15,
      frequencyChange: 5
    }
  ];

  // Eficiencia de entrenamiento
  const timeEfficiencyScore = Math.min(100, (workoutDays / 4) * 100);

  // Densidad de entrenamiento
  const trainingDensity = [
    {
      week: 'Actual',
      workoutsPerWeek: workoutDays,
      avgVolume: totalVolume / workoutDays
    }
  ];

  // Recomendaciones de recuperación
  const recoveryRecommendations = [];
  if (fatigueIndex > 70) {
    recoveryRecommendations.push('Considera tomar 2-3 días de descanso completo');
  } else if (fatigueIndex > 40) {
    recoveryRecommendations.push('Reduce la intensidad en tu próximo entrenamiento');
  } else {
    recoveryRecommendations.push('Tu recuperación está en buen estado');
  }

  return {
    fatigueAnalysis: {
      fatigueIndex,
      overreachingRisk,
      recoveryDays,
      recoveryRate,
      recoveryScore,
      workloadTrend: 'Estable' as const,
      stressFactors: { volumeStress, frequencyStress },
      predictedRecoveryTime: 24, // 24 horas estimadas
      fatigueHistory: { trend: 'Estable' as const, consistency: 80 },
      volumeDropIndicators: false,
      recoveryRecommendations
    },
    progressPrediction: {
      nextWeekWeight,
      monthlyGrowthRate,
      plateauRisk,
      trendAnalysis: 'mejorando' as const
    },
    intensityMetrics: {
      averageIntensity,
      volumeIntensity,
      frequencyIntensity,
      overallIntensity
    },
    periodComparisons,
    trainingEfficiency: {
      timeEfficiencyScore
    },
    trainingDensity
  };
}; 