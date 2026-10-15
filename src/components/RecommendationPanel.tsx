import React from 'react';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { TYRE_COMPOUNDS } from '../engine/strategyEngine';
import { SimulationEngineOutput } from '../types/telemetry';

interface RecommendationPanelProps {
  engineOutput: SimulationEngineOutput;
}

export const RecommendationPanel: React.FC<RecommendationPanelProps> = ({
  engineOutput,
}) => {
  const { recommendedId, recommendationHeadline, timeAdvantageSec, strategies } =
    engineOutput;
  const recommendedStrategy = strategies[recommendedId];
  const tyreInfo = TYRE_COMPOUNDS[recommendedStrategy.plannedCompound];

  // Plain-language action summary
  const getPlainLanguageSummary = () => {
    if (recommendedId === 'pit_now') {
      return 'Your tyres are wearing out, and the Safety Car reduces the estimated time lost during a pit stop.';
    }
    if (recommendedId === 'stay_out') {
      return 'Track conditions remain stable. Continuing on your current tyres preserves valuable track position over stopping now.';
    }
    return 'Rain radar is uncertain. Holding track position for 2 to 3 laps avoids a costly second pit stop if the weather shifts.';
  };

  return (
    <div className="relative rounded-lg border-2 border-[#D9F36A] bg-[#16181D] p-5 shadow-2xl overflow-hidden flex flex-col justify-between">
      {/* Top Banner Tag */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#262A30] pb-2.5 mb-3.5">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#D9F36A] text-black">
              <CheckCircle2 className="h-4 w-4 stroke-[3]" />
            </div>
            <span className="font-display text-xs font-black tracking-widest text-[#D9F36A] uppercase">
              RECOMMENDED ACTION
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[10px]">
            <span className="rounded bg-[#22262C] px-2 py-0.5 text-[#A0A8B4] border border-[#2E343D]">
              MODEL CONFIDENCE: {recommendedStrategy.confidenceScore}%
            </span>
            <span className="rounded bg-[#D9F36A]/10 px-2 py-0.5 text-[#D9F36A] font-bold border border-[#D9F36A]/30">
              SIMULATED ESTIMATE
            </span>
          </div>
        </div>

        {/* Large Action Title */}
        <div className="text-[11px] font-mono uppercase tracking-wider text-[#8E95A0]">
          CHIEF RACE STRATEGIST DIRECTIVE
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-black text-white tracking-wide mt-1">
          {recommendedStrategy.name}
        </h1>

        {/* Plain-Language 1-Sentence Reason */}
        <p className="mt-2 text-sm text-[#E2E8F0] leading-relaxed border-l-2 border-[#D9F36A] pl-3 py-0.5">
          "{getPlainLanguageSummary()}"
        </p>

        {/* Key Four Decision Metrics */}
        <div className="mt-4 grid grid-cols-2 gap-2.5 font-mono">
          {/* 1. Time Advantage */}
          <div className="rounded border border-[#2E343D] bg-[#131518] p-2.5">
            <div className="text-[10px] text-[#8E95A0] uppercase">
              ESTIMATED TIME ADVANTAGE
            </div>
            <div className="font-display text-2xl font-black text-[#D9F36A] mt-0.5">
              +{timeAdvantageSec}s
            </div>
            <div className="text-[10px] text-zinc-400">
              Faster than 2nd-best option
            </div>
          </div>

          {/* 2. Recommended Tyre */}
          <div className="rounded border border-[#2E343D] bg-[#131518] p-2.5">
            <div className="text-[10px] text-[#8E95A0] uppercase">
              RECOMMENDED TYRE
            </div>
            <div
              className="font-display text-xl font-bold flex items-center gap-1.5 mt-0.5"
              style={{ color: tyreInfo.color }}
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: tyreInfo.color }}
              />
              <span className="truncate">{tyreInfo.name.split(' ')[0]}</span>
            </div>
            <div className="text-[10px] text-zinc-400">
              Fitted at Lap {recommendedStrategy.plannedPitLap}
            </div>
          </div>

          {/* 3. Projected Finish Position */}
          <div className="rounded border border-[#2E343D] bg-[#131518] p-2.5">
            <div className="text-[10px] text-[#8E95A0] uppercase">
              PROJECTED FINISH
            </div>
            <div className="font-display text-2xl font-black text-white mt-0.5">
              P{recommendedStrategy.projectedFinishPosition}
            </div>
            <div className="text-[10px] text-zinc-400">
              Range: {recommendedStrategy.projectedPositionRange}
            </div>
          </div>

          {/* 4. Main Risk */}
          <div className="rounded border border-[#FF4438]/30 bg-[#FF4438]/10 p-2.5">
            <div className="flex items-center gap-1 text-[10px] text-[#FF4438] font-bold uppercase">
              <AlertTriangle className="h-3 w-3" />
              <span>MAIN RISK</span>
            </div>
            <div className="text-[10px] text-[#E5B5B2] font-mono mt-1 leading-snug line-clamp-2">
              {recommendedStrategy.majorRisk}
            </div>
          </div>
        </div>
      </div>

      {/* Model Transparency Note */}
      <div className="mt-4 pt-3 border-t border-[#262A30] flex items-center justify-between text-[10px] font-mono text-[#8E95A0]">
        <span>Simulated Madrid baseline: 76.5s dry / 88.0s wet</span>
        <span className="text-[#D9F36A]">100% Deterministic Model</span>
      </div>
    </div>
  );
};
