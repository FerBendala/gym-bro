import type { WorkoutRecord } from '../../../interfaces';
import { analyzeMuscleBalance, calculateBalanceScore, calculateCategoryAnalysis } from '../../../utils/functions/category-analysis';

export const calculateBalanceAnalysis = (records: WorkoutRecord[]) => {
  if (records.length === 0) {
    return {
      balanceScore: 0,
      finalConsistency: 0,
      avgIntensity: 0,
      avgFrequency: 0,
      muscleBalance: [],
      categoryAnalysis: {
        categoryMetrics: []
      },
      upperLowerBalance: {
        upper: { volume: 0, percentage: 0 },
        lower: { volume: 0, percentage: 0 }
      },
      selectedView: 'general' as const
    };
  }

  // Usar las funciones correctas de category-analysis
  const categoryAnalysis = calculateCategoryAnalysis(records);
  const muscleBalance = analyzeMuscleBalance(records);
  const balanceScore = calculateBalanceScore(muscleBalance, records);

  // Calcular balance superior/inferior
  const upperCategories = ['Pecho', 'Espalda', 'Hombros', 'Brazos'];
  const lowerCategories = ['Piernas', 'Core'];

  const upperVolume = upperCategories.reduce((sum, cat) => {
    const categoryData = muscleBalance.find(item => item.category === cat);
    return sum + (categoryData?.volume || 0);
  }, 0);

  const lowerVolume = lowerCategories.reduce((sum, cat) => {
    const categoryData = muscleBalance.find(item => item.category === cat);
    return sum + (categoryData?.volume || 0);
  }, 0);

  const totalVolume = upperVolume + lowerVolume;

  const upperLowerBalance = {
    upper: {
      volume: upperVolume,
      percentage: totalVolume > 0 ? (upperVolume / totalVolume) * 100 : 0
    },
    lower: {
      volume: lowerVolume,
      percentage: totalVolume > 0 ? (lowerVolume / totalVolume) * 100 : 0
    }
  };

  // Calcular consistencia
  const consistency = calculateConsistency(records);

  // Calcular intensidad promedio
  const avgIntensity = records.length > 0
    ? records.reduce((sum, r) => sum + r.weight, 0) / records.length
    : 0;

  // Calcular frecuencia promedio CORREGIDA: como en main, multiplicando por 33.33
  const avgFrequency = Math.min(100, muscleBalance.reduce((sum, b) => sum + (b.weeklyFrequency || 0), 0) / muscleBalance.length * 33.33);

  return {
    balanceScore,
    finalConsistency: consistency,
    avgIntensity,
    avgFrequency,
    muscleBalance: muscleBalance.map(balance => ({
      category: balance.category,
      percentage: balance.percentage,
      totalVolume: balance.volume,
      idealPercentage: balance.idealPercentage,
      intensityScore: balance.intensityScore,
      weeklyFrequency: balance.weeklyFrequency,
      isBalanced: balance.isBalanced,
      priorityLevel: balance.priorityLevel,
      progressTrend: balance.progressTrend,
      personalRecords: 0, // Se calculará después si es necesario
      balanceHistory: balance.balanceHistory
    })),
    categoryAnalysis,
    upperLowerBalance,
    selectedView: 'general' as const
  };
};

const calculateConsistency = (records: WorkoutRecord[]): number => {
  if (records.length === 0) return 0;

  const dates = records.map(r => r.date).sort((a, b) => a.getTime() - b.getTime());
  const firstDate = dates[0];
  const lastDate = dates[dates.length - 1];

  const totalDays = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
  const workoutDays = new Set(records.map(r => r.date.toDateString())).size;

  return totalDays > 0 ? (workoutDays / totalDays) * 100 : 0;
}; 