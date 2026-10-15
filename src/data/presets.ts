import { ScenarioPreset, SimulationParams } from '../types/telemetry';

export const DEFAULT_SIMULATION_PARAMS: SimulationParams = {
  currentLap: 31,
  totalLaps: 53,
  currentTyre: 'medium',
  tyreWear: 68, // Substantial wear
  fuelRemainingKg: 38.5, // ~22 laps remaining @ 1.75 kg/lap = ~38.5kg needed
  rainProbability: 75, // Approaching rain
  trackTempC: 28,
  safetyCar: 'full_sc', // SC deployed
  scLapsRemaining: 2,
  currentPosition: 3, // P3
};

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'preset_a',
    name: 'PRESET A — THE PERFECT STORM',
    tagline: 'High wear + Rain imminent + Safety Car',
    description:
      'Championship crisis: Mediums are at 72% wear, radar shows heavy rainfall within 3 laps, and a stranded car has deployed the Safety Car.',
    params: {
      currentLap: 31,
      currentTyre: 'medium',
      tyreWear: 72,
      fuelRemainingKg: 38.5,
      rainProbability: 78,
      trackTempC: 26,
      safetyCar: 'full_sc',
      scLapsRemaining: 2,
      currentPosition: 3,
    },
  },
  {
    id: 'preset_b',
    name: 'PRESET B — DRY-RACE GAMBLE',
    tagline: 'Dry track + High degradation + Green flag',
    description:
      'Clean track, rain cloud has drifted away. Slicks are degrading toward the thermal cliff under full green flag pit stop losses.',
    params: {
      currentLap: 31,
      currentTyre: 'medium',
      tyreWear: 65,
      fuelRemainingKg: 38.5,
      rainProbability: 12,
      trackTempC: 36,
      safetyCar: 'none',
      scLapsRemaining: 0,
      currentPosition: 3,
    },
  },
  {
    id: 'preset_c',
    name: 'PRESET C — WEATHER CHAOS',
    tagline: 'Uncertain 50/50 rain + Moderate wear + VSC',
    description:
      'Marginal conditions: 52% rain probability creates a critical crossover dilemma. Pitting now risks burning inters; staying out risks drowning on slicks.',
    params: {
      currentLap: 31,
      currentTyre: 'hard',
      tyreWear: 50,
      fuelRemainingKg: 40.0,
      rainProbability: 52,
      trackTempC: 24,
      safetyCar: 'vsc',
      scLapsRemaining: 1,
      currentPosition: 3,
    },
  },
];
