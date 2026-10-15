import React from 'react';
import { BarChart3, CheckCircle2, Clock, Zap } from 'lucide-react';
import { TYRE_COMPOUNDS } from '../engine/strategyEngine';
import { SimulationEngineOutput, StrategyResult } from '../types/telemetry';

interface StrategyBarChartProps {
  engineOutput: SimulationEngineOutput;
}

export const StrategyBarChart: React.FC<StrategyBarChartProps> = ({
  engineOutput,
}) => {
  const { strategies, recommendedId } = engineOutput;
  const list: StrategyResult[] = [
    strategies.pit_now,
    strategies.stay_out,
    strategies.wait_for_rain,
  ];

  const formatRaceTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${mins}m ${Number(secs) < 10 ? '0' : ''}${secs}s`;
  };

  // Find min and max for proportional horizontal bar width
  const times = list.map((s) => s.remainingRaceTimeSec);
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  const timeSpread = Math.max(1, maxTime - minTime);

  return (
    <div className="rounded-lg border border-[#262A30] bg-[#16181D] p-4 shadow-xl font-mono">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#262A30] pb-2.5 mb-3.5">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-[#D9F36A]" />
          <h3 className="font-display text-sm font-bold tracking-wider text-white">
            STRATEGY COMPARISON (PROJECTED RACE TIME TO FINISH)
          </h3>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[#8E95A0]">
          <span>SHORTER BAR = FASTER FINISH</span>
        </div>
      </div>

      {/* Horizontal Bars */}
      <div className="space-y-3">
        {list.map((strat) => {
          const isWinner = strat.id === recommendedId;
          const tyre = TYRE_COMPOUNDS[strat.plannedCompound];

          // Compute bar width percentage (fastest gets ~60%, slowest up to 96%)
          const relativePenalty = strat.remainingRaceTimeSec - minTime;
          const barWidthPercent = Math.min(
            100,
            Math.max(55, 60 + (relativePenalty / (timeSpread + 0.1)) * 36)
          );

          return (
            <div
              key={strat.id}
              className={`rounded-lg border p-3 transition-all ${
                isWinner
                  ? 'border-[#D9F36A]/80 bg-[#1D2128] ring-1 ring-[#D9F36A]/30'
                  : 'border-[#262A30] bg-[#131518]'
              }`}
            >
              {/* Row 1: Strategy Name, Compound, Delta */}
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-display font-bold text-white text-sm tracking-wide">
                    {strat.name}
                  </span>
                  <span
                    className="flex items-center gap-1 rounded border px-1.5 py-0.2 text-[9px] font-bold"
                    style={{
                      borderColor: `${tyre.color}66`,
                      color: tyre.color,
                      backgroundColor: `${tyre.color}15`,
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: tyre.color }}
                    />
                    {tyre.name.split(' ')[0]}
                  </span>
                  {isWinner && (
                    <span className="rounded bg-[#D9F36A] px-1.5 py-0.2 text-[9px] font-black text-black">
                      RECOMMENDED
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[#8E95A0] text-[11px]">
                    {formatRaceTime(strat.remainingRaceTimeSec)}
                  </span>
                  <span
                    className={`font-display font-bold text-xs ${
                      strat.isFastest ? 'text-[#D9F36A]' : 'text-[#FF4438]'
                    }`}
                  >
                    {strat.isFastest ? '0.0s (FASTEST)' : `+${strat.deltaToFastestSec}s`}
                  </span>
                </div>
              </div>

              {/* Row 2: Visual Bar */}
              <div className="h-3 w-full rounded bg-[#101214] overflow-hidden border border-[#262A30]">
                <div
                  className={`h-full transition-all duration-300 rounded ${
                    strat.isFastest
                      ? 'bg-[#D9F36A]'
                      : isWinner
                      ? 'bg-emerald-400'
                      : 'bg-[#505763]'
                  }`}
                  style={{ width: `${barWidthPercent}%` }}
                />
              </div>

              {/* Row 3: Short Sub-caption */}
              <div className="flex items-center justify-between text-[10px] text-[#8E95A0] mt-1.5">
                <span>Pit Lap: {strat.plannedPitLap > 53 ? 'None' : `L${strat.plannedPitLap}`}</span>
                <span>Projected Finish: <strong className="text-white">P{strat.projectedFinishPosition}</strong> ({strat.projectedPositionRange})</span>
                <span className={strat.riskLevel === 'LOW' ? 'text-emerald-400' : strat.riskLevel === 'MEDIUM' ? 'text-yellow-400' : 'text-[#FF4438]'}>
                  {strat.riskLevel} Risk
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
