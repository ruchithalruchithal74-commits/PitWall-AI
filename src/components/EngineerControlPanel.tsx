import React from 'react';
import {
  AlertOctagon,
  CloudRain,
  Flame,
  Fuel,
  Gauge,
  Sliders,
  Sparkles,
  Thermometer,
} from 'lucide-react';
import { TYRE_COMPOUNDS } from '../engine/strategyEngine';
import { SafetyCarStatus, SimulationParams, TyreCompound } from '../types/telemetry';

interface EngineerControlPanelProps {
  params: SimulationParams;
  onUpdateParams: (newParams: Partial<SimulationParams>) => void;
}

export const EngineerControlPanel: React.FC<EngineerControlPanelProps> = ({
  params,
  onUpdateParams,
}) => {
  const isSC = params.safetyCar === 'full_sc';
  const isVSC = params.safetyCar === 'vsc';

  const setSafetyCar = (status: SafetyCarStatus) => {
    onUpdateParams({
      safetyCar: status,
      scLapsRemaining: status === 'full_sc' ? 2 : status === 'vsc' ? 1 : 0,
    });
  };

  const getWearBadge = (wear: number) => {
    if (wear >= 75) {
      return { label: 'CRITICAL CLIFF', color: 'text-[#FF4438] bg-[#FF4438]/20 border-[#FF4438]/40' };
    }
    if (wear >= 60) {
      return { label: 'SUBSTANTIAL WEAR', color: 'text-amber-400 bg-amber-400/20 border-amber-400/40' };
    }
    if (wear >= 35) {
      return { label: 'MODERATE', color: 'text-yellow-300 bg-yellow-300/10 border-yellow-300/30' };
    }
    return { label: 'FRESH RUBBER', color: 'text-[#39D353] bg-[#39D353]/10 border-[#39D353]/30' };
  };

  const wearState = getWearBadge(params.tyreWear);

  return (
    <div className="rounded-lg border border-[#262A30] bg-[#16181D] p-4 shadow-xl">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-[#262A30] pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Sliders className="h-4 w-4 text-[#D9F36A]" />
          <h3 className="font-display text-sm font-bold tracking-wider text-white">
            RACE ENGINEER'S CONTROL TELEMETRY
          </h3>
        </div>
        <span className="text-[10px] font-mono text-[#8E95A0]">
          REAL-TIME STRATEGY INPUTS
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. CURRENT LAP CONTROL */}
        <div className="rounded border border-[#262A30] bg-[#191C20] p-3">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-[#8E95A0]">RACE LAP</span>
            <span className="font-bold text-white font-display text-sm">
              LAP {params.currentLap}{' '}
              <span className="text-xs text-[#8E95A0]">/ {params.totalLaps}</span>
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={53}
            value={params.currentLap}
            onChange={(e) => onUpdateParams({ currentLap: Number(e.target.value) })}
            className="w-full accent-[#D9F36A] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-[#8E95A0] mt-1">
            <span>Lap 1</span>
            <span className="text-[#D9F36A]">Default: 31</span>
            <span>Lap 53</span>
          </div>
        </div>

        {/* 2. CURRENT TYRE COMPOUND */}
        <div className="rounded border border-[#262A30] bg-[#191C20] p-3">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-[#8E95A0]">ACTIVE COMPOUND</span>
            <span className="font-bold text-white uppercase text-[11px]">
              {TYRE_COMPOUNDS[params.currentTyre].name}
            </span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {(['soft', 'medium', 'hard', 'intermediate'] as TyreCompound[]).map(
              (compound) => {
                const info = TYRE_COMPOUNDS[compound];
                const isSelected = params.currentTyre === compound;
                return (
                  <button
                    key={compound}
                    onClick={() => onUpdateParams({ currentTyre: compound })}
                    className={`rounded py-1.5 px-1 text-center font-mono text-xs font-bold transition-all border ${
                      isSelected
                        ? `${info.badgeColor} ring-1 ring-white/20 scale-102`
                        : 'border-[#262A30] bg-[#14171A] text-[#8E95A0] hover:border-[#3E4551] hover:text-white'
                    }`}
                  >
                    <div
                      className="mx-auto mb-1 h-2 w-2 rounded-full"
                      style={{ backgroundColor: info.color }}
                    />
                    <span className="block text-[10px] uppercase truncate">
                      {compound === 'intermediate' ? 'INTER' : compound}
                    </span>
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* 3. TYRE WEAR PERCENTAGE */}
        <div className="rounded border border-[#262A30] bg-[#191C20] p-3">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="text-[#8E95A0]">TYRE WEAR</span>
            <div className="flex items-center gap-1.5">
              <span
                className={`rounded border px-1.5 py-0.5 text-[9px] font-bold ${wearState.color}`}
              >
                {wearState.label}
              </span>
              <span className="font-bold text-white font-display text-sm">
                {params.tyreWear}%
              </span>
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={params.tyreWear}
            onChange={(e) => onUpdateParams({ tyreWear: Number(e.target.value) })}
            className="w-full accent-[#FF4438] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-[#8E95A0] mt-1">
            <span>0% Fresh</span>
            <span className="text-[#FF4438]">Cliff: &gt;72%</span>
            <span>100% Puncture Risk</span>
          </div>
        </div>

        {/* 4. FUEL REMAINING */}
        <div className="rounded border border-[#262A30] bg-[#191C20] p-3">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <div className="flex items-center gap-1 text-[#8E95A0]">
              <Fuel className="h-3 w-3" />
              <span>FUEL ONBOARD</span>
            </div>
            <span className="font-bold text-white font-display text-sm">
              {params.fuelRemainingKg.toFixed(1)} KG{' '}
              <span className="text-xs text-[#8E95A0]">
                (~{Math.round(params.fuelRemainingKg / 1.75)} Laps)
              </span>
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={60}
            step={0.5}
            value={params.fuelRemainingKg}
            onChange={(e) =>
              onUpdateParams({ fuelRemainingKg: Number(e.target.value) })
            }
            className="w-full accent-cyan-400 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-[#8E95A0] mt-1">
            <span>5 kg (Limp)</span>
            <span>Burn: 1.75 kg/lap</span>
            <span>60 kg</span>
          </div>
        </div>

        {/* 5. RAIN PROBABILITY */}
        <div className="rounded border border-[#262A30] bg-[#191C20] p-3">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <div className="flex items-center gap-1 text-[#8E95A0]">
              <CloudRain className="h-3 w-3" />
              <span>RAIN PROBABILITY</span>
            </div>
            <span
              className={`font-bold font-display text-sm ${
                params.rainProbability >= 60
                  ? 'text-blue-400'
                  : params.rainProbability >= 35
                  ? 'text-cyan-300'
                  : 'text-zinc-300'
              }`}
            >
              {params.rainProbability}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={params.rainProbability}
            onChange={(e) =>
              onUpdateParams({ rainProbability: Number(e.target.value) })
            }
            className="w-full accent-blue-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-[#8E95A0] mt-1">
            <span>Dry (0%)</span>
            <span className="text-cyan-400">Crossover: ~55%</span>
            <span>Heavy Wet (100%)</span>
          </div>
        </div>

        {/* 6. TRACK TEMPERATURE */}
        <div className="rounded border border-[#262A30] bg-[#191C20] p-3">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <div className="flex items-center gap-1 text-[#8E95A0]">
              <Thermometer className="h-3 w-3" />
              <span>TRACK TEMPERATURE</span>
            </div>
            <span className="font-bold text-white font-display text-sm">
              {params.trackTempC}°C
            </span>
          </div>
          <input
            type="range"
            min={15}
            max={48}
            value={params.trackTempC}
            onChange={(e) =>
              onUpdateParams({ trackTempC: Number(e.target.value) })
            }
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-[#8E95A0] mt-1">
            <span>15°C Cold</span>
            <span className="text-emerald-400">Optimum: 28-32°C</span>
            <span>48°C Overheating</span>
          </div>
        </div>
      </div>

      {/* SAFETY CAR STATUS CONTROL BAR */}
      <div className="mt-4 rounded border border-[#262A30] bg-[#14171A] p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertOctagon
            className={`h-5 w-5 ${
              isSC ? 'text-[#FF4438] animate-pulse' : 'text-[#8E95A0]'
            }`}
          />
          <div>
            <div className="font-display font-bold text-white text-xs tracking-wider">
              SAFETY CAR & RACE NEUTRALIZATION STATE
            </div>
            <p className="text-[10px] font-mono text-[#8E95A0]">
              Alters Madrid pit lane time loss (Green: 21.5s vs SC: 10.4s)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSafetyCar('none')}
            className={`px-3 py-1.5 rounded font-mono text-xs font-bold transition-all border ${
              params.safetyCar === 'none'
                ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                : 'border-[#262A30] bg-[#191C20] text-[#8E95A0] hover:text-white'
            }`}
          >
            GREEN FLAG
          </button>

          <button
            onClick={() => setSafetyCar('vsc')}
            className={`px-3 py-1.5 rounded font-mono text-xs font-bold transition-all border ${
              isVSC
                ? 'border-yellow-500 bg-yellow-500/20 text-yellow-300'
                : 'border-[#262A30] bg-[#191C20] text-[#8E95A0] hover:text-white'
            }`}
          >
            VSC (14.2s LOSS)
          </button>

          <button
            onClick={() => setSafetyCar('full_sc')}
            className={`px-4 py-1.5 rounded font-mono text-xs font-bold transition-all border ${
              isSC
                ? 'border-[#FF4438] bg-[#FF4438] text-black font-black shadow-lg shadow-[#FF4438]/20 animate-pulse'
                : 'border-[#FF4438]/50 bg-[#FF4438]/10 text-[#FF4438] hover:bg-[#FF4438]/20'
            }`}
          >
            {isSC ? '⚠️ DEPLOYED (10.4s LOSS)' : 'DEPLOY SAFETY CAR'}
          </button>
        </div>
      </div>
    </div>
  );
};
