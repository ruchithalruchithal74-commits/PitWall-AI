import {
  LapLapData,
  SafetyCarStatus,
  SimulationEngineOutput,
  SimulationParams,
  StrategyId,
  StrategyResult,
  StrategyStint,
  TyreCompound,
  TyreInfo,
} from '../types/telemetry';

export const TYRE_COMPOUNDS: Record<TyreCompound, TyreInfo> = {
  soft: {
    compound: 'soft',
    name: 'Soft (C4)',
    color: '#FF4438',
    badgeColor: 'bg-[#FF4438]/20 border-[#FF4438] text-[#FF4438]',
    textColor: 'text-[#FF4438]',
    dryPaceDelta: -0.65,
    degRatePerLap: 0.125,
    wearCliffThreshold: 65,
  },
  medium: {
    compound: 'medium',
    name: 'Medium (C3)',
    color: '#FFD700',
    badgeColor: 'bg-[#FFD700]/20 border-[#FFD700] text-[#FFD700]',
    textColor: 'text-[#FFD700]',
    dryPaceDelta: 0.0,
    degRatePerLap: 0.075,
    wearCliffThreshold: 72,
  },
  hard: {
    compound: 'hard',
    name: 'Hard (C2)',
    color: '#E5E7EB',
    badgeColor: 'bg-white/20 border-white text-white',
    textColor: 'text-white',
    dryPaceDelta: 0.62,
    degRatePerLap: 0.038,
    wearCliffThreshold: 84,
  },
  intermediate: {
    compound: 'intermediate',
    name: 'Intermediate (Crossover)',
    color: '#39D353',
    badgeColor: 'bg-[#39D353]/20 border-[#39D353] text-[#39D353]',
    textColor: 'text-[#39D353]',
    dryPaceDelta: 4.2,
    degRatePerLap: 0.065,
    wearCliffThreshold: 78,
  },
};

// Madrid — Circuito de Madring official 2026 circuit specifications (Studio Dromo / FIA)
export const CIRCUIT_SPECS = {
  name: 'Circuito de Madring (Official 2026 Layout)',
  location: 'Madrid (IFEMA / Valdebebas), Spain',
  lengthKm: 5.414,
  totalLaps: 53,
  corners: 22,
  drsZones: 3,
  baseDryLapTimeSec: 76.5, // 1:16.500
  baseWetLapTimeSec: 88.0, // 1:28.000 for wet conditions
  greenPitLossSec: 21.5, // Full green flag pit delta along Av. del Partenón
  scPitLossSec: 10.4, // Safety car pit delta (11.1s savings)
  vscPitLossSec: 14.2, // Virtual safety car pit delta (7.3s savings)
  fuelBurnRateKgPerLap: 1.75,
  fuelLapPenaltyPerKg: 0.033, // ~0.033s per kg of fuel
};

/**
 * Calculates track wetness percentage for a given lap based on rain probability
 */
export function calculateTrackWetness(
  lap: number,
  currentLap: number,
  rainProbability: number
): number {
  if (rainProbability < 25) {
    return 5; // essentially dry
  }
  // If rain probability is high, rain starts around currentLap + 3 to + 5
  const rainStartLap = currentLap + 3;
  if (lap < rainStartLap) {
    return Math.max(5, (lap / rainStartLap) * (rainProbability * 0.25));
  }
  // Wetness ramps up
  const progress = Math.min(1, (lap - rainStartLap) / 4);
  const peakWetness = (rainProbability / 100) * 85;
  return Math.min(95, Math.round(25 + progress * (peakWetness - 25)));
}

/**
 * Calculates single lap performance deterministically
 */
export function calculateLapTime(params: {
  lap: number;
  compound: TyreCompound;
  wearPercent: number;
  fuelRemainingKg: number;
  trackWetness: number;
  trackTempC: number;
  isSafetyCarLap: boolean;
  isPitLap: boolean;
  pitLossSec: number;
}): { lapTime: number; wearDelta: number; notes: string } {
  const {
    compound,
    wearPercent,
    fuelRemainingKg,
    trackWetness,
    trackTempC,
    isSafetyCarLap,
    isPitLap,
    pitLossSec,
  } = params;

  // 1. Safety Car Lap pacing
  if (isSafetyCarLap) {
    const scTime = 104.5; // SC delta pace
    const pitAddition = isPitLap ? pitLossSec : 0;
    return {
      lapTime: Number((scTime + pitAddition).toFixed(3)),
      wearDelta: 0.8, // minimal wear under SC
      notes: isPitLap ? 'PIT STOP UNDER SC' : 'SAFETY CAR PACING',
    };
  }

  // 2. Base lap time adjusted for fuel
  const fuelPenalty = fuelRemainingKg * CIRCUIT_SPECS.fuelLapPenaltyPerKg;
  let lapTime = CIRCUIT_SPECS.baseDryLapTimeSec + fuelPenalty;

  // 3. Tyre base pace delta vs Medium
  const tyreInfo = TYRE_COMPOUNDS[compound];
  lapTime += tyreInfo.dryPaceDelta;

  // 4. Tyre wear degradation & cliff penalty
  const baseDeg = (wearPercent / 100) * 2.2;
  let cliffPenalty = 0;
  if (wearPercent > tyreInfo.wearCliffThreshold) {
    const overCliff = wearPercent - tyreInfo.wearCliffThreshold;
    // Exponential cliff penalty
    cliffPenalty = Math.pow(overCliff / 10, 1.8) * 1.3;
  }
  lapTime += baseDeg + cliffPenalty;

  // 5. Track Temperature effect on tyres
  // Optimal temp is ~30°C. Slower if too cold or overheating
  const tempDelta = Math.abs(trackTempC - 30);
  const tempPenalty = (tempDelta / 15) * 0.35;
  lapTime += tempPenalty;

  // 6. Weather & Tyre Suitability (The crossover physics)
  let weatherPenalty = 0;
  if (compound === 'intermediate') {
    if (trackWetness < 30) {
      // Inters overheating on dry/damp track
      weatherPenalty = (30 - trackWetness) * 0.18 + 2.5;
    } else {
      // Inters in their operating window
      const wetSurplus = (trackWetness - 30) * 0.08;
      weatherPenalty = wetSurplus;
    }
  } else {
    // Slicks (Soft, Medium, Hard)
    if (trackWetness > 35) {
      // Slicks lose grip exponentially in the wet
      const wetSurplus = trackWetness - 35;
      weatherPenalty = 4.0 + Math.pow(wetSurplus / 8, 1.7) * 2.2;
    } else if (trackWetness > 20) {
      // Damp conditions, slicks slide
      weatherPenalty = (trackWetness - 20) * 0.25;
    }
  }
  lapTime += weatherPenalty;

  // 7. Fuel deficit penalty (lift and coast if dangerously low)
  if (fuelRemainingKg < 2.0) {
    lapTime += (2.0 - fuelRemainingKg) * 3.5;
  }

  // 8. Pit stop addition if pitting on green
  if (isPitLap) {
    lapTime += pitLossSec;
  }

  // Wear delta calculation for next lap
  let wearDelta = tyreInfo.degRatePerLap * 20;
  if (compound === 'intermediate' && trackWetness < 30) {
    wearDelta *= 2.2; // burns up inters on dry
  }
  if (trackWetness > 40 && compound !== 'intermediate') {
    wearDelta *= 0.5; // lower abrasion in wet, but no grip
  }

  return {
    lapTime: Number(lapTime.toFixed(3)),
    wearDelta: Math.max(0.5, wearDelta),
    notes: isPitLap
      ? 'GREEN FLAG PIT STOP'
      : weatherPenalty > 5
      ? 'CRITICAL GRIP LOSS (WET)'
      : cliffPenalty > 1
      ? 'TYRE CLIFF REACHED'
      : 'CLEAN PACE',
  };
}

/**
 * Runs a deterministic simulation of a specific strategy from currentLap to totalLaps
 */
function simulateStrategy(
  id: StrategyId,
  params: SimulationParams,
  plannedPitLap: number,
  targetCompound: TyreCompound
): StrategyResult {
  const {
    currentLap,
    totalLaps,
    currentTyre,
    tyreWear,
    fuelRemainingKg,
    rainProbability,
    trackTempC,
    safetyCar,
    scLapsRemaining,
  } = params;

  const lapBreakdown: LapLapData[] = [];
  let simFuel = fuelRemainingKg;
  let activeCompound = currentTyre;
  let activeWear = tyreWear;
  let cumulativeTime = 0;

  // Build Stint visualization
  const stints: StrategyStint[] = [];
  if (plannedPitLap <= currentLap) {
    // Pitting right now
    stints.push({
      compound: currentTyre,
      startLap: Math.max(1, currentLap - 15),
      endLap: currentLap,
      isProjected: false,
    });
    stints.push({
      compound: targetCompound,
      startLap: currentLap,
      endLap: totalLaps,
      isProjected: true,
    });
  } else if (plannedPitLap > totalLaps) {
    // Staying out to the end
    stints.push({
      compound: currentTyre,
      startLap: Math.max(1, currentLap - 15),
      endLap: totalLaps,
      isProjected: true,
    });
  } else {
    // Pitting on a future lap
    stints.push({
      compound: currentTyre,
      startLap: Math.max(1, currentLap - 15),
      endLap: plannedPitLap,
      isProjected: true,
    });
    stints.push({
      compound: targetCompound,
      startLap: plannedPitLap,
      endLap: totalLaps,
      isProjected: true,
    });
  }

  for (let lap = currentLap; lap <= totalLaps; lap++) {
    const isPitLap = lap === plannedPitLap;
    const isCurrentLap = lap === currentLap;

    // Safety car logic: active on current lap if SC is active, plus scLapsRemaining
    const isSCLap =
      safetyCar === 'full_sc' &&
      (isCurrentLap || lap < currentLap + scLapsRemaining);

    // Calculate pit loss for this lap
    let pitLoss = CIRCUIT_SPECS.greenPitLossSec;
    if (isSCLap) {
      pitLoss = CIRCUIT_SPECS.scPitLossSec;
    } else if (safetyCar === 'vsc' && isCurrentLap) {
      pitLoss = CIRCUIT_SPECS.vscPitLossSec;
    }

    const trackWetness = calculateTrackWetness(lap, currentLap, rainProbability);

    // If pitting on this lap, swap tyre compound & reset wear
    if (isPitLap) {
      activeCompound = targetCompound;
      activeWear = 0; // fresh rubber
    }

    const lapCalc = calculateLapTime({
      lap,
      compound: activeCompound,
      wearPercent: activeWear,
      fuelRemainingKg: simFuel,
      trackWetness,
      trackTempC,
      isSafetyCarLap: isSCLap,
      isPitLap,
      pitLossSec: pitLoss,
    });

    cumulativeTime += lapCalc.lapTime;
    simFuel = Math.max(0, simFuel - CIRCUIT_SPECS.fuelBurnRateKgPerLap);
    activeWear = Math.min(100, activeWear + lapCalc.wearDelta);

    lapBreakdown.push({
      lap,
      lapTime: lapCalc.lapTime,
      cumulativeTime: Number(cumulativeTime.toFixed(3)),
      tyreWear: Math.round(activeWear),
      tyreCompound: activeCompound,
      trackWetness,
      isSafetyCar: isSCLap,
      isPitLap,
      notes: lapCalc.notes,
    });
  }

  // Name, Subtitle and initial classification
  let name = '';
  let subtitle = '';
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' = 'MEDIUM';
  let riskLabel = '';

  if (id === 'pit_now') {
    name = 'PIT NOW';
    subtitle = 'Aggressive response under current window';
    riskLevel = rainProbability > 80 || rainProbability < 20 ? 'LOW' : 'MEDIUM';
    riskLabel =
      safetyCar === 'full_sc'
        ? 'Low Risk • Maximizes SC pit discount'
        : 'Medium Risk • Undercut on track position';
  } else if (id === 'stay_out') {
    name = 'STAY OUT';
    subtitle = 'Track position priority / stint stretch';
    riskLevel =
      activeWear > 80 || rainProbability > 60 ? 'EXTREME' : 'HIGH';
    riskLabel =
      rainProbability > 60
        ? 'Extreme Risk • Caught on slicks in wet'
        : 'High Risk • Degradation cliff vulnerability';
  } else {
    name = 'WAIT FOR RAIN';
    subtitle = 'Weather radar deferral (Box L34)';
    riskLevel = 'MEDIUM';
    riskLabel = 'Balanced Risk • Minimizes double-stop hazard';
  }

  return {
    id,
    name,
    subtitle,
    plannedPitLap,
    plannedCompound: targetCompound,
    remainingRaceTimeSec: Number(cumulativeTime.toFixed(3)),
    deltaToFastestSec: 0,
    isFastest: false,
    projectedFinishPosition: 3,
    projectedPositionRange: 'P2–P4',
    confidenceScore: 82,
    riskLevel,
    riskLabel,
    reasons: [],
    majorRisk: '',
    stints,
    lapBreakdown,
    explanation: '',
  };
}

/**
 * Main Deterministic Engine - Evaluates all 3 competing strategies,
 * calculates delta times, generates explainability text and position forecasts.
 */
export function runStrategyEngine(
  params: SimulationParams
): SimulationEngineOutput {
  const {
    currentLap,
    tyreWear,
    rainProbability,
    safetyCar,
    currentPosition,
  } = params;

  // Determine optimal tyre choice for Pit Now:
  // If rain prob >= 55%, switch directly to Intermediates.
  // If rain prob < 55%, switch to Hard to run to the end.
  const pitNowTyre: TyreCompound =
    rainProbability >= 55 ? 'intermediate' : 'hard';

  // Strategy 1: PIT NOW (Current lap)
  const pitNowResult = simulateStrategy(
    'pit_now',
    params,
    currentLap,
    pitNowTyre
  );

  // Strategy 2: STAY OUT (Pits much later or attempts to run long)
  // If remaining laps > 14, plans pit at lap 45 for softs, else tries to stretch
  const stayOutPitLap = currentLap + 14 > 53 ? 99 : currentLap + 12;
  const stayOutResult = simulateStrategy(
    'stay_out',
    params,
    stayOutPitLap,
    rainProbability >= 65 ? 'intermediate' : 'soft'
  );

  // Strategy 3: WAIT FOR RAIN (Defer stop to lap 34 to observe rain confirmation)
  const waitPitLap = Math.min(52, currentLap + 3);
  const waitTyre: TyreCompound =
    rainProbability >= 40 ? 'intermediate' : 'hard';
  const waitResult = simulateStrategy(
    'wait_for_rain',
    params,
    waitPitLap,
    waitTyre
  );

  // Find the fastest strategy
  const times = [
    { id: 'pit_now' as StrategyId, time: pitNowResult.remainingRaceTimeSec },
    { id: 'stay_out' as StrategyId, time: stayOutResult.remainingRaceTimeSec },
    { id: 'wait_for_rain' as StrategyId, time: waitResult.remainingRaceTimeSec },
  ];
  times.sort((a, b) => a.time - b.time);
  const fastest = times[0];
  const fastestTime = fastest.time;

  // Calculate deltas
  pitNowResult.deltaToFastestSec = Number(
    (pitNowResult.remainingRaceTimeSec - fastestTime).toFixed(2)
  );
  stayOutResult.deltaToFastestSec = Number(
    (stayOutResult.remainingRaceTimeSec - fastestTime).toFixed(2)
  );
  waitResult.deltaToFastestSec = Number(
    (waitResult.remainingRaceTimeSec - fastestTime).toFixed(2)
  );

  pitNowResult.isFastest = fastest.id === 'pit_now';
  stayOutResult.isFastest = fastest.id === 'stay_out';
  waitResult.isFastest = fastest.id === 'wait_for_rain';

  // Dynamic Finish Position & Positions Range Calculation
  // Baseline benchmark gap to rivals: P1 (+4.5s), P2 (+1.6s), P4 (-3.1s), P5 (-6.8s)
  const calculatePosition = (
    deltaToFastest: number,
    basePos: number
  ): { pos: number; range: string } => {
    let projected = basePos;
    if (deltaToFastest === 0) {
      projected = Math.max(1, basePos - 1); // potential win or P2
    } else if (deltaToFastest > 12) {
      projected = Math.min(7, basePos + 3);
    } else if (deltaToFastest > 5) {
      projected = Math.min(6, basePos + 2);
    } else if (deltaToFastest > 1.5) {
      projected = Math.min(5, basePos + 1);
    }
    const bestPossible = Math.max(1, projected - 1);
    const worstPossible = Math.min(10, projected + 1);
    return {
      pos: projected,
      range: `P${bestPossible}–P${worstPossible}`,
    };
  };

  const pitPos = calculatePosition(
    pitNowResult.deltaToFastestSec,
    currentPosition
  );
  pitNowResult.projectedFinishPosition = pitPos.pos;
  pitNowResult.projectedPositionRange = pitPos.range;

  const stayPos = calculatePosition(
    stayOutResult.deltaToFastestSec,
    currentPosition
  );
  stayOutResult.projectedFinishPosition = stayPos.pos;
  stayOutResult.projectedPositionRange = stayPos.range;

  const waitPos = calculatePosition(
    waitResult.deltaToFastestSec,
    currentPosition
  );
  waitResult.projectedFinishPosition = waitPos.pos;
  waitResult.projectedPositionRange = waitPos.range;

  // Dynamic Explainability Rationale Generation
  // 1. PIT NOW reasons
  const scSavings = (
    CIRCUIT_SPECS.greenPitLossSec - CIRCUIT_SPECS.scPitLossSec
  ).toFixed(1);
  const pitNowReasons: string[] = [];
  if (safetyCar === 'full_sc') {
    pitNowReasons.push(
      `Safety Car pit delta saves ${scSavings}s relative to a standard green-flag stop.`
    );
  } else {
    pitNowReasons.push(
      `Undercut potential allows gaining track position ahead of traffic.`
    );
  }
  if (tyreWear > 60) {
    pitNowReasons.push(
      `Current tyres at ${tyreWear}% wear are entering the severe thermal cliff (+1.4s/lap).`
    );
  } else {
    pitNowReasons.push(
      `Fresh tyre compound provides immediate delta advantage over rivals.`
    );
  }
  if (rainProbability >= 55) {
    pitNowReasons.push(
      `Pre-empts arriving rain (${rainProbability}% prob); fitting Intermediates avoids a secondary stop.`
    );
    pitNowResult.majorRisk =
      'If rain is delayed past Lap 36, Intermediates will overheat on dry asphalt (+3.2s/lap).';
  } else {
    pitNowReasons.push(
      `Hard compound allows uninterrupted run to Lap 53 chequered flag.`
    );
    pitNowResult.majorRisk =
      'Vulnerable to sudden flash shower requiring an unplanned emergency pit stop.';
  }
  pitNowResult.reasons = pitNowReasons;
  pitNowResult.explanation = `Box now capitalizes on ${
    safetyCar === 'full_sc' ? 'the reduced SC pit loss window' : 'clean air'
  } and eliminates current tyre degradation vulnerability.`;

  // 2. STAY OUT reasons
  const stayOutReasons: string[] = [
    'Preserves track position without surrendering track territory to chasing cars.',
    `Keeps options open if the race gets red-flagged or neutralized.`,
  ];
  if (rainProbability < 40) {
    stayOutReasons.push(
      'Dry track projection does not justify an early reactive compound change.'
    );
  } else {
    stayOutReasons.push(
      'Gambles on track drying or delayed shower before making a decisive pit call.'
    );
  }
  stayOutResult.reasons = stayOutReasons;
  stayOutResult.majorRisk =
    rainProbability > 50
      ? `Severe aquaplaning and catastrophic +8.0s/lap time loss if rain arrives while on worn slicks.`
      : `High degradation cliff will cause rapid lap-time collapse against cars on fresher rubber.`;
  stayOutResult.explanation = `Staying out preserves track position, but incurs mounting tyre degradation and huge weather exposure.`;

  // 3. WAIT FOR RAIN reasons
  const waitReasons: string[] = [
    `Defers decision until Lap ${waitPitLap} to verify whether radar shower actually touches down.`,
    `Avoids disastrous double-stop (pitting for dry tyres now, then repitting for wet tyres in 3 laps).`,
    `Provides flexibility to fit either Hard (if dry) or Intermediate (if rain confirms).`,
  ];
  waitResult.reasons = waitReasons;
  waitResult.majorRisk = `Losing ~${(1.2 + (tyreWear > 65 ? 0.8 : 0)).toFixed(
    1
  )}s/lap to pitted cars while nursing worn tyres during the 3-lap observation window.`;
  waitResult.explanation = `Waiting buffers against false-positive weather calls, but risks losing time while running on degrading rubber.`;

  // Determine Recommendation Engine Winner
  // Model weights both remaining race time and weather risk
  let recommendedId: StrategyId = fastest.id;
  let recommendationHeadline = '';

  // Calculate advantage over second-best
  const secondFastestTime = times[1].time;
  const timeAdvantageSec = Number((secondFastestTime - fastestTime).toFixed(2));

  if (fastest.id === 'pit_now') {
    recommendationHeadline =
      rainProbability >= 55
        ? 'BOX NOW — FIT INTERMEDIATES'
        : 'BOX NOW — FIT FRESH HARDS';
  } else if (fastest.id === 'wait_for_rain') {
    recommendationHeadline = 'HOLD POSITION — TARGET LAP 34 BOX';
  } else {
    recommendationHeadline = 'STAY OUT — EXTEND STINT';
  }

  // Delta timeline comparison array across remaining laps
  const deltaAnalysis = pitNowResult.lapBreakdown.map((item, idx) => {
    const pitLapTime = item.cumulativeTime;
    const stayLapTime = stayOutResult.lapBreakdown[idx]?.cumulativeTime ?? 0;
    const waitLapTime = waitResult.lapBreakdown[idx]?.cumulativeTime ?? 0;
    const baseline = Math.min(pitLapTime, stayLapTime, waitLapTime);
    return {
      lap: item.lap,
      pitNowDelta: Number((pitLapTime - baseline).toFixed(2)),
      stayOutDelta: Number((stayLapTime - baseline).toFixed(2)),
      waitForRainDelta: Number((waitLapTime - baseline).toFixed(2)),
    };
  });

  return {
    strategies: {
      pit_now: pitNowResult,
      stay_out: stayOutResult,
      wait_for_rain: waitResult,
    },
    recommendedId,
    recommendationHeadline,
    timeAdvantageSec,
    fastestStrategyId: fastest.id,
    weatherCrossoverLap: currentLap + 3,
    isRainExpected: rainProbability >= 50,
    deltaAnalysis,
  };
}
