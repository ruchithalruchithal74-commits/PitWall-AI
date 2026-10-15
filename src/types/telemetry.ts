export type TyreCompound = 'soft' | 'medium' | 'hard' | 'intermediate';

export type SafetyCarStatus = 'full_sc' | 'vsc' | 'none';

export type StrategyId = 'pit_now' | 'stay_out' | 'wait_for_rain';

export interface TyreInfo {
  compound: TyreCompound;
  name: string;
  color: string;
  badgeColor: string;
  textColor: string;
  dryPaceDelta: number; // vs Medium baseline (sec)
  degRatePerLap: number; // seconds lost per lap
  wearCliffThreshold: number; // percentage where deg spikes
}

export interface SimulationParams {
  currentLap: number;
  totalLaps: number;
  currentTyre: TyreCompound;
  tyreWear: number; // 0 - 100%
  fuelRemainingKg: number; // in kg (default ~38kg)
  rainProbability: number; // 0 - 100%
  trackTempC: number; // 15 - 45°C
  safetyCar: SafetyCarStatus;
  scLapsRemaining: number;
  currentPosition: number; // e.g. 3 (P3)
}

export interface LapLapData {
  lap: number;
  lapTime: number; // in seconds
  cumulativeTime: number;
  tyreWear: number;
  tyreCompound: TyreCompound;
  trackWetness: number; // 0 - 100%
  isSafetyCar: boolean;
  isPitLap: boolean;
  notes?: string;
}

export interface StrategyStint {
  compound: TyreCompound;
  startLap: number;
  endLap: number;
  isProjected: boolean;
}

export interface StrategyResult {
  id: StrategyId;
  name: string;
  subtitle: string;
  plannedPitLap: number;
  plannedCompound: TyreCompound;
  remainingRaceTimeSec: number;
  deltaToFastestSec: number;
  isFastest: boolean;
  projectedFinishPosition: number;
  projectedPositionRange: string;
  confidenceScore: number; // 0 - 100%
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  riskLabel: string;
  reasons: string[];
  majorRisk: string;
  stints: StrategyStint[];
  lapBreakdown: LapLapData[];
  explanation: string;
}

export interface SimulationEngineOutput {
  strategies: Record<StrategyId, StrategyResult>;
  recommendedId: StrategyId;
  recommendationHeadline: string;
  timeAdvantageSec: number;
  fastestStrategyId: StrategyId;
  weatherCrossoverLap: number;
  isRainExpected: boolean;
  deltaAnalysis: {
    lap: number;
    pitNowDelta: number;
    stayOutDelta: number;
    waitForRainDelta: number;
  }[];
}

export interface EventLogItem {
  id: string;
  lap: number;
  timestamp: string;
  type: 'strategy' | 'sc' | 'tyre' | 'weather' | 'radio';
  severity: 'info' | 'warning' | 'alert' | 'critical';
  message: string;
  details?: string;
}

export interface ScenarioPreset {
  id: string;
  name: string;
  tagline: string;
  description: string;
  params: Partial<SimulationParams>;
}
