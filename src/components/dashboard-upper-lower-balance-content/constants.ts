export const META_CATEGORIES = {
  UPPER_BODY: { idealPercentage: 60 },
  LOWER_BODY: { idealPercentage: 35 },
  CORE: { idealPercentage: 5 },
} as const;

export const TREND_THRESHOLDS = {
  BALANCE_TOLERANCE: 5,
  MAX_FREQUENCY: 3.5,
  IDEAL_FREQUENCY: 2.5,
  INTENSITY_REDUCTION_FACTOR: 0.9,
  MIN_INTENSITY: 60,
  MAX_INTENSITY: 80,
} as const;
