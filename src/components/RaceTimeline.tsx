import React, { useState } from 'react';
import { CloudRain, Flag, Milestone, ShieldAlert } from 'lucide-react';
import { TYRE_COMPOUNDS } from '../engine/strategyEngine';
import { SimulationEngineOutput, SimulationParams } from '../types/telemetry';

interface RaceTimelineProps {
  params: SimulationParams;
  engineOutput: SimulationEngineOutput;
}

export const RaceTimeline: React.FC<RaceTimelineProps> = ({
  params,
  engineOutput,
}) => {
  const [hoveredLap, setHoveredLap] = useState<number | null>(null);

  const totalLaps = 53;
  const currentLap = params.currentLap;
  const { strategies, weatherCrossoverLap, isRainExpected } = engineOutput;

  // Laps array 1 to 53
  const laps = Array.from({ length: totalLaps }, (_, i) => i + 1);

  // Key event markers on timeline
  const isSafetyCarLap = (lap: number) => {
    if (params.safetyCar === 'full_sc') {
      return lap >= currentLap && lap <= currentLap + params.scLapsRemaining;
    }
    return false;
  };

  const isRainZoneLap = (lap: number) => {
    return isRainExpected && lap >= weatherCrossoverLap;
  };

  return (
    <div className="rounded-lg border border-[#262A30] bg-[#16181D] p-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#262A30] pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <Milestone className="h-4 w-4 text-[#D9F36A]" />
          <h3 className="font-display text-sm font-bold tracking-wider text-white">
            53-LAP RACE TIMELINE & TACTICAL WINDOWS
          </h3>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono text-[#8E95A0]">
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-zinc-600" />
            <span>PAST LAPS (1–{currentLap - 1})</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#D9F36A]" />
            <span>CURRENT (LAP {currentLap})</span>
          </div>
          {params.safetyCar === 'full_sc' && (
            <div className="flex items-center gap-1 text-[#FF4438]">
              <span className="h-2 w-2 rounded-full bg-[#FF4438] animate-ping" />
              <span>SC WINDOW</span>
            </div>
          )}
          {isRainExpected && (
            <div className="flex items-center gap-1 text-blue-400">
              <CloudRain className="h-3 w-3" />
              <span>RAIN CROSSOVER (L{weatherCrossoverLap}+)</span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive 53-Lap Bar */}
      <div className="relative pt-2 pb-4">
        {/* Track Laps Grid Bar */}
        <div className="relative flex h-8 w-full rounded border border-[#262A30] bg-[#121417] overflow-hidden">
          {laps.map((lap) => {
            const isPast = lap < currentLap;
            const isCurrent = lap === currentLap;
            const isSC = isSafetyCarLap(lap);
            const isRain = isRainZoneLap(lap);
            const isPitNowLap = lap === strategies.pit_now.plannedPitLap;
            const isWaitPitLap = lap === strategies.wait_for_rain.plannedPitLap;
            const isHovered = hoveredLap === lap;

            let bgColor = 'bg-transparent';
            if (isPast) bgColor = 'bg-[#1C2026]';
            if (isSC) bgColor = 'bg-[#FF4438]/25';
            else if (isRain) bgColor = 'bg-blue-600/20';

            return (
              <div
                key={lap}
                onMouseEnter={() => setHoveredLap(lap)}
                onMouseLeave={() => setHoveredLap(null)}
                className={`flex-1 h-full border-r border-[#1E2228] transition-all cursor-pointer relative ${bgColor} ${
                  isHovered ? 'ring-1 ring-white z-10' : ''
                }`}
                title={`Lap ${lap}`}
              >
                {/* Current Lap Marker */}
                {isCurrent && (
                  <div className="absolute inset-0 bg-[#D9F36A] flex items-center justify-center font-mono text-[9px] font-black text-black z-20">
                    {lap}
                  </div>
                )}

                {/* Pit Window Dots */}
                {isPitNowLap && !isCurrent && (
                  <div
                    className="absolute top-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-[#D9F36A] ring-1 ring-black"
                    title="Pit Now Window"
                  />
                )}
                {isWaitPitLap && (
                  <div
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 h-2 w-2 rounded-full bg-[#39D353] ring-1 ring-black"
                    title="Wait For Rain Window"
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Lap Milestone Labels */}
        <div className="flex justify-between font-mono text-[10px] text-[#656E7B] mt-1.5 px-0.5">
          <span>L1 (START)</span>
          <span>L10</span>
          <span>L20</span>
          <span className="text-[#D9F36A] font-bold">L{currentLap} (CURRENT)</span>
          {isRainExpected && (
            <span className="text-blue-400 font-bold">L{weatherCrossoverLap} (RAIN)</span>
          )}
          <span>L40</span>
          <span>L50</span>
          <span>L53 (CHEQUERED)</span>
        </div>

        {/* Strategy Pit Windows Legend Rail */}
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 font-mono text-xs">
          {/* Pit Now Stint */}
          <div className="rounded border border-[#2E343D] bg-[#14171A] p-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#D9F36A]" />
              <span className="text-white font-bold text-[11px]">PIT NOW STRATEGY</span>
            </div>
            <div className="text-[10px] text-[#8E95A0]">
              Box Lap {strategies.pit_now.plannedPitLap} →{' '}
              <span className="text-white font-bold uppercase">
                {strategies.pit_now.plannedCompound}
              </span>
            </div>
          </div>

          {/* Stay Out Stint */}
          <div className="rounded border border-[#2E343D] bg-[#14171A] p-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="text-white font-bold text-[11px]">STAY OUT STRATEGY</span>
            </div>
            <div className="text-[10px] text-[#8E95A0]">
              Extend to L{strategies.stay_out.plannedPitLap > 53 ? '53' : strategies.stay_out.plannedPitLap}
            </div>
          </div>

          {/* Wait For Rain Stint */}
          <div className="rounded border border-[#2E343D] bg-[#14171A] p-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#39D353]" />
              <span className="text-white font-bold text-[11px]">WAIT FOR RAIN</span>
            </div>
            <div className="text-[10px] text-[#8E95A0]">
              Box Lap {strategies.wait_for_rain.plannedPitLap} →{' '}
              <span className="text-white font-bold uppercase">
                {strategies.wait_for_rain.plannedCompound}
              </span>
            </div>
          </div>
        </div>

        {/* Hover inspection pill */}
        {hoveredLap && (
          <div className="mt-2 text-center font-mono text-xs text-[#A0A8B4]">
            Inspecting Lap <span className="text-white font-bold">{hoveredLap}</span>:{' '}
            {hoveredLap < currentLap ? (
              <span className="text-[#8E95A0]">Completed in first stint</span>
            ) : hoveredLap === currentLap ? (
              <span className="text-[#D9F36A]">Active Decision Point</span>
            ) : isSafetyCarLap(hoveredLap) ? (
              <span className="text-[#FF4438]">Under Safety Car Delta</span>
            ) : isRainZoneLap(hoveredLap) ? (
              <span className="text-blue-400">Wet Track / Intermediate Suitable</span>
            ) : (
              <span className="text-emerald-400">Racing Green Flag</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
