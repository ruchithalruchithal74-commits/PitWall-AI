import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  FastForward,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import { TYRE_COMPOUNDS } from '../engine/strategyEngine';
import { SimulationEngineOutput, SimulationParams, StrategyResult } from '../types/telemetry';

interface SimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  engineOutput: SimulationEngineOutput;
  params: SimulationParams;
}

export const SimulationModal: React.FC<SimulationModalProps> = ({
  isOpen,
  onClose,
  engineOutput,
  params,
}) => {
  const [currentSimLap, setCurrentSimLap] = useState(params.currentLap);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFinished, setIsFinished] = useState(false);

  const { strategies, recommendedId, fastestStrategyId } = engineOutput;
  const totalLaps = params.totalLaps;

  // Reset simulation when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentSimLap(params.currentLap);
      setIsPlaying(true);
      setIsFinished(false);
    }
  }, [isOpen, params.currentLap]);

  // Lap-by-lap simulation animation timer
  useEffect(() => {
    if (!isOpen || !isPlaying || isFinished) return;

    const timer = setInterval(() => {
      setCurrentSimLap((prev) => {
        if (prev >= totalLaps) {
          setIsPlaying(false);
          setIsFinished(true);
          return totalLaps;
        }
        return prev + 1;
      });
    }, 280);

    return () => clearInterval(timer);
  }, [isOpen, isPlaying, isFinished, totalLaps]);

  if (!isOpen) return null;

  const handleReplay = () => {
    setCurrentSimLap(params.currentLap);
    setIsPlaying(true);
    setIsFinished(false);
  };

  const handleJumpToEnd = () => {
    setCurrentSimLap(totalLaps);
    setIsPlaying(false);
    setIsFinished(true);
  };

  const simProgress = Math.round(
    ((currentSimLap - params.currentLap) /
      Math.max(1, totalLaps - params.currentLap)) *
      100
  );

  const formatRaceTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${mins}m ${Number(secs) < 10 ? '0' : ''}${secs}s`;
  };

  const strategyArray: StrategyResult[] = [
    strategies.pit_now,
    strategies.stay_out,
    strategies.wait_for_rain,
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-xl border border-[#3A404A] bg-[#14171A] p-6 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#262A30] pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-[#D9F36A] text-black">
              <Zap className="h-4 w-4 fill-black" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white tracking-wider">
                LIVE RACE STRATEGY SIMULATION
              </h3>
              <p className="text-xs font-mono text-[#8E95A0]">
                Madrid MADRING • Simulating Laps {params.currentLap} through {totalLaps}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#262A30] bg-[#191C20] text-[#8E95A0] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Lap Progression Rail */}
        <div className="mb-6 rounded-lg border border-[#262A30] bg-[#191C20] p-4 font-mono">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-[#8E95A0]">SIMULATION PROGRESSION:</span>
            <span className="font-display font-bold text-base text-white">
              LAP {currentSimLap}{' '}
              <span className="text-xs text-[#8E95A0]">/ {totalLaps}</span>{' '}
              <span className="text-[#D9F36A]">({simProgress}%)</span>
            </span>
          </div>

          <div className="h-3 w-full rounded-full bg-[#101214] overflow-hidden border border-[#262A30]">
            <div
              className="h-full bg-gradient-to-r from-[#D9F36A] to-emerald-400 transition-all duration-200"
              style={{ width: `${simProgress}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-3 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="rounded border border-[#2E343D] bg-[#121417] px-3 py-1 font-bold text-white hover:border-[#4A5260]"
              >
                {isPlaying ? 'PAUSE' : 'RESUME'}
              </button>
              <button
                onClick={handleJumpToEnd}
                className="rounded border border-[#2E343D] bg-[#121417] px-3 py-1 text-[#A0A8B4] hover:text-white"
              >
                FAST-FORWARD
              </button>
            </div>

            <button
              onClick={handleReplay}
              className="flex items-center gap-1 text-[#8E95A0] hover:text-white"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>REPLAY SCENARIO</span>
            </button>
          </div>
        </div>

        {/* Live Head-to-Head Strategy Performance Comparison */}
        <div className="space-y-3 font-mono">
          <div className="text-xs uppercase tracking-wider text-[#8E95A0]">
            HEAD-TO-HEAD CALCULATED REMAINING TIME & DELTA:
          </div>

          {strategyArray.map((strat) => {
            const isRec = strat.id === recommendedId;
            const tyre = TYRE_COMPOUNDS[strat.plannedCompound];

            // Progressive remaining time preview
            return (
              <div
                key={strat.id}
                className={`flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3.5 transition-all ${
                  isRec
                    ? 'border-[#D9F36A] bg-[#1E2229] shadow-lg shadow-[#D9F36A]/10'
                    : 'border-[#262A30] bg-[#16181D]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: tyre.color }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-bold text-white text-sm">
                          {strat.name}
                        </span>
                        {isRec && (
                          <span className="rounded bg-[#D9F36A] px-1.5 py-0.2 text-[9px] font-black text-black">
                            CHIEF PICK
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#8E95A0]">
                        Pit Lap {strat.plannedPitLap} → {tyre.name}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <div className="text-right">
                    <div className="text-[10px] text-[#8E95A0]">REMAINING TIME</div>
                    <div className="font-bold text-white font-display text-sm">
                      {formatRaceTime(strat.remainingRaceTimeSec)}
                    </div>
                  </div>

                  <div className="text-right min-w-[90px]">
                    <div className="text-[10px] text-[#8E95A0]">DELTA</div>
                    <div
                      className={`font-bold font-display text-sm ${
                        strat.isFastest ? 'text-[#D9F36A]' : 'text-[#FF4438]'
                      }`}
                    >
                      {strat.isFastest
                        ? '0.00s (P1)'
                        : `+${strat.deltaToFastestSec}s`}
                    </div>
                  </div>

                  <div className="rounded border border-[#2E343D] bg-[#121417] px-2.5 py-1 text-center min-w-[65px]">
                    <div className="text-[9px] text-[#8E95A0]">FINISH</div>
                    <div className="font-bold text-[#D9F36A] font-display">
                      P{strat.projectedFinishPosition}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Finished Podium & Summary */}
        {isFinished && (
          <div className="mt-5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4 font-mono animate-in fade-in">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase mb-1">
              <Trophy className="h-4 w-4" />
              <span>SIMULATION COMPLETE — VERIFIED STRATEGY OUTCOME</span>
            </div>
            <p className="text-xs text-[#C0D9C8] leading-relaxed">
              <strong className="text-white">{strategies[recommendedId].name}</strong> yields
              the optimal race execution, securing an estimated{' '}
              <strong className="text-emerald-400 font-bold">
                P{strategies[recommendedId].projectedFinishPosition}
              </strong>{' '}
              finish with a net advantage of{' '}
              <strong className="text-emerald-400 font-bold">
                +{engineOutput.timeAdvantageSec}s
              </strong>{' '}
              over competing decisions.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded bg-[#D9F36A] px-5 py-2 font-mono text-xs font-bold text-black hover:bg-[#cbe656] transition-all"
          >
            RETURN TO WAR ROOM
          </button>
        </div>
      </div>
    </div>
  );
};
