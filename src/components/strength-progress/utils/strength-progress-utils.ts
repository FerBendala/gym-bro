import { PHASE_COLORS, RATE_COLORS, ZONE_COLORS } from '../constants';
import type { PhaseType, RateType, ZoneType } from '../types';

export const getPhaseColor = (phase: string): string => {
  return PHASE_COLORS[phase as PhaseType] || PHASE_COLORS.novice;
};

export const getRateColor = (rate: string): string => {
  return RATE_COLORS[rate as RateType] || RATE_COLORS.slow;
};

export const getZoneColor = (zone: string): string => {
  return ZONE_COLORS[zone as ZoneType] || ZONE_COLORS.volume;
};

export const getPlateauRiskColor = (risk: number): string => {
  if (risk > 70) return 'text-red-400';
  if (risk > 40) return 'text-yellow-400';
  return 'text-green-400';
};

export const getPlateauRiskBgColor = (risk: number): string => {
  if (risk > 70) return 'bg-red-500';
  if (risk > 40) return 'bg-yellow-500';
  return 'bg-green-500';
}; 