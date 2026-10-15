import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CloudLightning,
  CloudRain,
  Flame,
  Sun,
  X,
  Zap,
} from 'lucide-react';
import { SimulationParams } from '../types/telemetry';

interface WhatIfSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  params: SimulationParams;
  onApplyEvent: (newParams: Partial<SimulationParams>, explanation: string) => void;
}

interface RaceEventOption {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ReactNode;
  changes: Partial<SimulationParams>;
  explanation: string;
}

export const WhatIfSimulatorModal: React.FC<WhatIfSimulatorModalProps> = ({
  isOpen,
  onClose,
  params,
  onApplyEvent,
}) => {
  const isSC = params.safetyCar === 'full_sc';

  const events: RaceEventOption[] = [
    {
      id: 'sc_toggle',
      title: isSC ? 'Safety Car Called In (Restart)' : 'Safety Car Deployed',
      subtitle: isSC
        ? 'Neutralization ends; green-flag pit loss increases back to 21.5s'
        : 'Track incident triggers Safety Car; pit stop loss drops to 10.4s (saves 11.1s)',
      badge: isSC ? 'GREEN FLAG' : '11.1s CHEAPER BOX',
      icon: <AlertTriangle className="h-5 w-5 text-[#FF4438]" />,
      changes: {
        safetyCar: isSC ? 'none' : 'full_sc',
        scLapsRemaining: isSC ? 0 : 2,
      },
      explanation: isSC
        ? 'Safety Car withdrawn. Green-flag pit stop loss of 21.5s restored. Staying out gains value.'
        : 'Safety Car deployed! The pit lane stop loss drops to just 10.4s, making an immediate stop highly advantageous.',
    },
    {
      id: 'rain_early',
      title: 'Rain Arrives Earlier (Torrential Rain Hits Now)',
      subtitle: 'Rain clouds accelerate; precipitation jumps to 92% and wetness crosses slick limit',
      badge: 'INTERMEDIATE MANDATORY',
      icon: <CloudLightning className="h-5 w-5 text-blue-400" />,
      changes: {
        rainProbability: 92,
        trackTempC: 22,
      },
      explanation:
        'Rainstorm arrives ahead of schedule! Slicks will lose over 12s/lap immediately. Fitting Intermediates right now is mandatory.',
    },
    {
      id: 'rain_delayed',
      title: 'Rain Cloud Misses Track (Dry Race Run Out)',
      subtitle: 'Wind blows radar shower away; rain probability drops to 12%',
      badge: 'DRY RUN TO FINISH',
      icon: <Sun className="h-5 w-5 text-amber-400" />,
      changes: {
        rainProbability: 12,
        trackTempC: 34,
      },
      explanation:
        'Rain threat evaporates! The track will stay dry through Lap 53. Strategy shifts to fitting Hard slicks or nursing current tyres.',
    },
    {
      id: 'deg_surge',
      title: 'Tyre Degradation Spikes (Thermal Cliff)',
      subtitle: 'Surface blistering escalates wear to 84%; car begins sliding and losing 1.8s/lap',
      badge: 'CRITICAL WEAR (+1.8s/LAP)',
      icon: <Flame className="h-5 w-5 text-[#FF4438]" />,
      changes: {
        tyreWear: 84,
      },
      explanation:
        'Tyres have fallen off the cliff! Grip has collapsed to critical levels. Staying out is no longer viable without surrendering multiple positions.',
    },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-xl border border-[#3A404A] bg-[#14171A] p-5 sm:p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#262A30] pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-[#D9F36A] text-black">
              <Zap className="h-4 w-4 fill-black" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-white tracking-wide">
                WHAT-IF STRATEGY SIMULATOR
              </h3>
              <p className="text-xs font-mono text-[#8E95A0]">
                Select a tactical race event to instantly recalculate all 3 strategies
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded border border-[#262A30] bg-[#191C20] text-[#8E95A0] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 4 Event Choice Cards */}
        <div className="space-y-3 font-mono">
          {events.map((evt) => (
            <div
              key={evt.id}
              onClick={() => {
                onApplyEvent(evt.changes, evt.explanation);
                onClose();
              }}
              className="flex items-center justify-between gap-3 rounded-lg border border-[#2E343D] bg-[#191C20] p-3.5 hover:border-[#D9F36A] hover:bg-[#1E232B] transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded border border-[#383E48] bg-[#121417] group-hover:border-[#D9F36A]">
                  {evt.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm font-bold text-white group-hover:text-[#D9F36A]">
                      {evt.title}
                    </span>
                    <span className="rounded bg-[#22262C] px-1.5 py-0.2 text-[9px] text-[#A0A8B4] border border-[#2E343D]">
                      {evt.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8E95A0] mt-0.5 leading-snug">
                    {evt.subtitle}
                  </p>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-1 text-xs text-[#D9F36A] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                <span>SIMULATE</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-[#262A30] flex items-center justify-between text-xs font-mono text-[#8E95A0]">
          <span>Changes are deterministic and recalculate instantly</span>
          <button
            onClick={onClose}
            className="text-white hover:text-[#D9F36A] transition-colors"
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
};
