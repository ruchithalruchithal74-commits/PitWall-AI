import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';
import { TYRE_COMPOUNDS } from '../engine/strategyEngine';
import {
  SimulationEngineOutput,
  StrategyId,
  StrategyResult,
  TyreCompound,
} from '../types/telemetry';

interface StrategyWarRoomProps {
  engineOutput: SimulationEngineOutput;
}

export const StrategyWarRoom: React.FC<StrategyWarRoomProps> = ({
  engineOutput,
}) => {
  const { strategies, recommendedId } = engineOutput;
  const strategyList: StrategyResult[] = [
    strategies.pit_now,
    strategies.stay_out,
    strategies.wait_for_rain,
  ];

  const formatRaceTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${mins}m ${Number(secs) < 10 ? '0' : ''}${secs}s`;
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'LOW':
        return 'border-emerald-500/40 bg-emerald-500/15 text-emerald-400';
      case 'MEDIUM':
        return 'border-yellow-500/40 bg-yellow-500/15 text-yellow-300';
      case 'HIGH':
      case 'EXTREME':
        return 'border-[#FF4438]/40 bg-[#FF4438]/15 text-[#FF4438]';
      default:
        return 'border-zinc-700 bg-zinc-800 text-zinc-300';
    }
  };

  return (
    <div className="rounded-lg border border-[#262A30] bg-[#16181D] p-4 shadow-xl font-mono">
      {/* War Room Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#262A30] pb-2.5 mb-3.5">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-[#D9F36A]" />
          <h2 className="font-display text-sm font-bold tracking-wider text-white">
            THE STRATEGY WAR ROOM — THREE STRATEGY CHOICES
          </h2>
        </div>
        <div className="text-[10px] text-[#8E95A0]">
          EVALUATED UNDER IDENTICAL MODEL ASSUMPTIONS
        </div>
      </div>

      {/* 3 Simple Comparison Panels Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {strategyList.map((strategy) => {
          const isWinner = strategy.id === recommendedId;
          const tyreInfo = TYRE_COMPOUNDS[strategy.plannedCompound];

          // Clear one-sentence plain English explanation
          let oneSentenceExplanation = strategy.explanation;
          if (strategy.id === 'pit_now') {
            oneSentenceExplanation =
              'Stops immediately to capitalize on the reduced Safety Car pit loss and get ahead of the tyre degradation cliff.';
          } else if (strategy.id === 'stay_out') {
            oneSentenceExplanation =
              'Keeps track position by stretching the current stint, but risks huge lap-time loss as tyres degrade or rain arrives.';
          } else {
            oneSentenceExplanation =
              'Defers the stop for 3 laps to verify rain radar, avoiding a costly double-stop if the forecast is wrong.';
          }

          return (
            <div
              key={strategy.id}
              className={`relative flex flex-col rounded-lg border p-4 transition-all ${
                isWinner
                  ? 'border-[#D9F36A] bg-[#1C2027] ring-1 ring-[#D9F36A]/40 shadow-xl'
                  : 'border-[#262A30] bg-[#131518]'
              }`}
            >
              {/* Highlight Badge */}
              {isWinner && (
                <div className="absolute -top-3 left-4 flex items-center gap-1 rounded bg-[#D9F36A] px-2.5 py-0.5 text-[10px] font-black text-black uppercase tracking-wider">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>RECOMMENDED CHOICE</span>
                </div>
              )}

              {/* Title & Delta Row */}
              <div className="flex items-center justify-between border-b border-[#22262C] pb-2 mb-3 pt-1">
                <h3 className="font-display text-lg font-black text-white tracking-wide">
                  {strategy.name}
                </h3>
                <span
                  className={`font-display text-base font-bold ${
                    strategy.isFastest ? 'text-[#D9F36A]' : 'text-[#FF4438]'
                  }`}
                >
                  {strategy.isFastest ? 'FASTEST (0.0s)' : `+${strategy.deltaToFastestSec}s`}
                </span>
              </div>

              {/* Six Required Data Points ONLY */}
              <div className="space-y-2 text-xs">
                {/* 1. Remaining Race Time */}
                <div className="flex items-center justify-between">
                  <span className="text-[#8E95A0]">EST. REMAINING TIME:</span>
                  <span className="font-bold text-white">
                    {formatRaceTime(strategy.remainingRaceTimeSec)}
                  </span>
                </div>

                {/* 2. Difference From Fastest */}
                <div className="flex items-center justify-between">
                  <span className="text-[#8E95A0]">DIFFERENCE FROM FASTEST:</span>
                  <span
                    className={`font-bold ${
                      strategy.isFastest ? 'text-[#D9F36A]' : 'text-zinc-300'
                    }`}
                  >
                    {strategy.isFastest ? '0.00s' : `+${strategy.deltaToFastestSec}s`}
                  </span>
                </div>

                {/* 3. Planned Pit Lap */}
                <div className="flex items-center justify-between">
                  <span className="text-[#8E95A0]">PLANNED PIT LAP:</span>
                  <span className="font-bold text-white">
                    {strategy.plannedPitLap > 53
                      ? 'No Stop (Run Out)'
                      : `Lap ${strategy.plannedPitLap}`}
                  </span>
                </div>

                {/* 4. Recommended Tyre */}
                <div className="flex items-center justify-between">
                  <span className="text-[#8E95A0]">RECOMMENDED TYRE:</span>
                  <span
                    className="font-bold flex items-center gap-1.5"
                    style={{ color: tyreInfo.color }}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: tyreInfo.color }}
                    />
                    {tyreInfo.name.split(' ')[0]}
                  </span>
                </div>

                {/* 5. Risk: LOW, MODERATE or HIGH */}
                <div className="flex items-center justify-between pt-1 border-t border-[#22262C]">
                  <span className="text-[#8E95A0]">RISK LEVEL:</span>
                  <span
                    className={`rounded border px-2 py-0.5 text-[10px] font-bold ${getRiskBadge(
                      strategy.riskLevel
                    )}`}
                  >
                    {strategy.riskLevel === 'MEDIUM' ? 'MODERATE' : strategy.riskLevel} RISK
                  </span>
                </div>
              </div>

              {/* 6. One-Sentence Explanation */}
              <div className="mt-4 pt-3 border-t border-[#22262C] flex-1 flex flex-col justify-end">
                <div className="text-[10px] text-[#8E95A0] uppercase mb-1">
                  STRATEGY RATIONALE:
                </div>
                <p className="text-[11px] text-[#C4CAD4] leading-relaxed">
                  {oneSentenceExplanation}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
