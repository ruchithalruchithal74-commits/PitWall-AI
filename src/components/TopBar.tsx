import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Clock,
  Flag,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';
import { SCENARIO_PRESETS } from '../data/presets';
import { SafetyCarStatus, ScenarioPreset, SimulationParams } from '../types/telemetry';

interface TopBarProps {
  params: SimulationParams;
  onUpdateParams: (newParams: Partial<SimulationParams>) => void;
  onSelectPreset: (preset: ScenarioPreset) => void;
  onReset: () => void;
  onOpenSimulation: () => void;
  onOpenWhatIf: () => void;
  activePresetId?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  params,
  onUpdateParams,
  onSelectPreset,
  onReset,
  onOpenSimulation,
  onOpenWhatIf,
  activePresetId,
}) => {
  const [raceSeconds, setRaceSeconds] = useState(3862);

  useEffect(() => {
    const timer = setInterval(() => {
      setRaceSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatRaceClock = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `0${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isSC = params.safetyCar === 'full_sc';
  const isVSC = params.safetyCar === 'vsc';

  const toggleSafetyCar = () => {
    const nextStatus: SafetyCarStatus = isSC ? 'none' : 'full_sc';
    onUpdateParams({
      safetyCar: nextStatus,
      scLapsRemaining: nextStatus === 'full_sc' ? 2 : 0,
    });
  };

  return (
    <header className="border-b border-[#262A30] bg-[#14171A] px-4 py-2.5 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Brand, Circuit, Simulated Label */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-[#FF4438] text-black font-black text-xs font-display tracking-wider">
              PW
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display text-lg font-bold tracking-wider text-white">
                  PITWALL<span className="text-[#D9F36A]">.AI</span>
                </span>
                <span className="rounded bg-[#262A30] px-1.5 py-0.5 text-[10px] font-mono font-semibold tracking-wider text-[#A0A8B4]">
                  MADRID / MADRING
                </span>
              </div>
              <p className="text-[10px] font-mono text-[#8E95A0] tracking-wide">
                EVERY SECOND IS A DECISION
              </p>
            </div>
          </div>

          <div className="hidden sm:block h-6 w-px bg-[#262A30]" />

          <div className="hidden sm:flex items-center gap-1.5 rounded border border-[#3A404A] bg-[#191C20] px-2 py-0.5 text-[10px] font-mono text-[#A0A8B4]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D9F36A] animate-ping" />
            <span>SIMULATED RACE</span>
          </div>
        </div>

        {/* Center: Lap, Position, Safety Car Status */}
        <div className="flex items-center gap-2 sm:gap-3 font-mono text-xs">
          {/* LAP 31 / 53 */}
          <div className="rounded border border-[#262A30] bg-[#191C20] px-3 py-1 text-center">
            <div className="text-[9px] uppercase tracking-wider text-[#8E95A0]">
              LAP
            </div>
            <div className="font-display text-base font-bold text-white tracking-wide">
              {params.currentLap}{' '}
              <span className="text-xs font-normal text-[#8E95A0]">
                / {params.totalLaps}
              </span>
            </div>
          </div>

          {/* DRIVER POSITION: P3 */}
          <div className="rounded border border-[#262A30] bg-[#191C20] px-3 py-1 text-center">
            <div className="text-[9px] uppercase tracking-wider text-[#8E95A0]">
              DRIVER POSITION
            </div>
            <div className="font-display text-base font-bold text-[#D9F36A]">
              P{params.currentPosition}
            </div>
          </div>

          {/* Safety Car status button */}
          <button
            onClick={toggleSafetyCar}
            title="Click to toggle Safety Car deployment"
            className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-bold transition-all border ${
              isSC
                ? 'border-[#FF4438] bg-[#FF4438]/20 text-[#FF4438] animate-pulse shadow-lg shadow-[#FF4438]/20'
                : isVSC
                ? 'border-yellow-500 bg-yellow-500/20 text-yellow-400'
                : 'border-[#262A30] bg-[#191C20] text-[#A0A8B4] hover:border-yellow-500/50 hover:text-white'
            }`}
          >
            {isSC ? (
              <AlertTriangle className="h-3.5 w-3.5 text-[#FF4438]" />
            ) : (
              <Flag className="h-3.5 w-3.5 text-emerald-400" />
            )}
            <span className="font-mono text-[11px] uppercase tracking-wider">
              {isSC ? 'SAFETY CAR: ACTIVE' : isVSC ? 'VIRTUAL SC' : 'TRACK: GREEN'}
            </span>
          </button>
        </div>

        {/* Right: Presets, What-If Event Simulator & Reset */}
        <div className="flex items-center gap-2">
          {/* Quick Presets Dropdown */}
          <div className="hidden lg:flex items-center gap-1 rounded bg-[#191C20] p-0.5 border border-[#262A30]">
            {SCENARIO_PRESETS.map((preset) => {
              const isSelected = activePresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => onSelectPreset(preset)}
                  className={`px-2 py-1 text-[10px] font-mono rounded font-semibold transition-colors ${
                    isSelected
                      ? 'bg-[#2E343D] text-white border border-[#454D5A]'
                      : 'text-[#8E95A0] hover:text-white'
                  }`}
                  title={preset.description}
                >
                  {preset.name.split('—')[0].replace('PRESET ', '').trim()}
                </button>
              );
            })}
          </div>

          {/* What-If Event Button */}
          <button
            onClick={onOpenWhatIf}
            className="flex items-center gap-1 rounded border border-[#D9F36A]/50 bg-[#D9F36A]/10 px-2.5 py-1.5 text-xs font-mono font-bold text-[#D9F36A] hover:bg-[#D9F36A]/20 transition-all"
          >
            <Zap className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">WHAT-IF</span>
          </button>

          {/* Run Full Race Simulation Button */}
          <button
            onClick={onOpenSimulation}
            className="flex items-center gap-1.5 rounded bg-[#D9F36A] px-3 py-1.5 text-xs font-bold text-black hover:bg-[#c9e557] active:scale-95 transition-all font-mono"
          >
            <Sparkles className="h-3.5 w-3.5 fill-black" />
            <span className="tracking-wide">RUN SIM</span>
          </button>

          {/* Reset button */}
          <button
            onClick={onReset}
            title="Reset to default Lap 31 Madrid demo scenario"
            className="flex h-8 w-8 items-center justify-center rounded border border-[#262A30] bg-[#191C20] text-[#A0A8B4] hover:border-[#454D5A] hover:text-white transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
