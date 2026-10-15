/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Info,
  ShieldAlert,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';

import { DEFAULT_SIMULATION_PARAMS, SCENARIO_PRESETS } from './data/presets';
import { runStrategyEngine } from './engine/strategyEngine';
import {
  EventLogItem,
  ScenarioPreset,
  SimulationParams,
} from './types/telemetry';

import { TopBar } from './components/TopBar';
import { RaceSituationBanner } from './components/RaceSituationBanner';
import { CircuitStage } from './components/CircuitStage';
import { RecommendationPanel } from './components/RecommendationPanel';
import { StrategyWarRoom } from './components/StrategyWarRoom';
import { StrategyBarChart } from './components/StrategyBarChart';
import { WhatIfSimulatorModal } from './components/WhatIfSimulatorModal';
import { SimulationModal } from './components/SimulationModal';

// Collapsible Advanced Components
import { EngineerControlPanel } from './components/EngineerControlPanel';
import { RaceTimeline } from './components/RaceTimeline';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { EventLog } from './components/EventLog';

export default function App() {
  const [params, setParams] = useState<SimulationParams>(DEFAULT_SIMULATION_PARAMS);
  const [activePresetId, setActivePresetId] = useState<string | undefined>('preset_a');
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
  const [isWhatIfOpen, setIsWhatIfOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [eventToast, setEventToast] = useState<string | null>(null);

  // Initial event log
  const [events, setEvents] = useState<EventLogItem[]>([
    {
      id: 'e1',
      lap: 30,
      timestamp: '15:42:08',
      type: 'sc',
      severity: 'critical',
      message: 'SAFETY CAR DEPLOYED (SECTOR 2)',
      details: 'Incident at Turn 12 exit. Pit stop delta reduced to 10.4s (saves 11.1s).',
    },
    {
      id: 'e2',
      lap: 30,
      timestamp: '15:42:25',
      type: 'weather',
      severity: 'alert',
      message: 'WEATHER RADAR: 75% RAIN PROBABILITY',
      details: 'Rain onset estimated within 3 laps (crossover near Lap 34).',
    },
    {
      id: 'e3',
      lap: 31,
      timestamp: '15:43:10',
      type: 'tyre',
      severity: 'warning',
      message: 'TYRE WEAR AT 68% (HIGH)',
      details: 'Current Medium compound approaching thermal degradation cliff.',
    },
    {
      id: 'e4',
      lap: 31,
      timestamp: '15:43:18',
      type: 'strategy',
      severity: 'info',
      message: 'RECOMMENDATION CALCULATED: PIT NOW',
      details: 'Estimated advantage +6.85s over Stay Out.',
    },
  ]);

  // Pure deterministic strategy engine execution
  const engineOutput = useMemo(() => {
    return runStrategyEngine(params);
  }, [params]);

  // Watch for parameter shifts and append to event log
  const prevParamsRef = useRef<SimulationParams>(params);

  useEffect(() => {
    const prev = prevParamsRef.current;
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    if (prev.safetyCar !== params.safetyCar) {
      if (params.safetyCar === 'full_sc') {
        addEvent({
          lap: params.currentLap,
          timestamp: timeStr,
          type: 'sc',
          severity: 'critical',
          message: 'SAFETY CAR DEPLOYED',
          details: 'Pit lane loss reduced to 10.4s (saves 11.1s). Pit window open.',
        });
      } else if (params.safetyCar === 'none') {
        addEvent({
          lap: params.currentLap,
          timestamp: timeStr,
          type: 'sc',
          severity: 'info',
          message: 'SAFETY CAR IN THIS LAP — GREEN FLAG',
          details: 'Standard 21.5s pit loss restored.',
        });
      }
    }

    if (prev.tyreWear < 72 && params.tyreWear >= 72) {
      addEvent({
        lap: params.currentLap,
        timestamp: timeStr,
        type: 'tyre',
        severity: 'critical',
        message: `TYRE CLIFF REACHED (${params.tyreWear}%)`,
        details: 'Severe grip drop (+1.6s/lap penalty). Immediate stop advised.',
      });
    }

    if (Math.abs(prev.rainProbability - params.rainProbability) >= 20) {
      addEvent({
        lap: params.currentLap,
        timestamp: timeStr,
        type: 'weather',
        severity: params.rainProbability >= 55 ? 'alert' : 'info',
        message: `WEATHER RADAR UPDATE: ${params.rainProbability}% RAIN`,
        details:
          params.rainProbability >= 55
            ? 'Track crossover projected to Intermediate window.'
            : 'Track expected to remain dry.',
      });
    }

    prevParamsRef.current = params;
  }, [params]);

  const addEvent = (item: Omit<EventLogItem, 'id'>) => {
    setEvents((prev) => [
      {
        id: `e-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        ...item,
      },
      ...prev.slice(0, 35),
    ]);
  };

  const handleUpdateParams = (newParams: Partial<SimulationParams>) => {
    setActivePresetId(undefined);
    setParams((prev) => ({ ...prev, ...newParams }));
  };

  const handleSelectPreset = (preset: ScenarioPreset) => {
    setActivePresetId(preset.id);
    setParams((prev) => ({
      ...prev,
      ...preset.params,
    }));
    setEventToast(`Preset applied: ${preset.name}`);
    setTimeout(() => setEventToast(null), 4000);
  };

  const handleReset = () => {
    setParams(DEFAULT_SIMULATION_PARAMS);
    setActivePresetId('preset_a');
    setEventToast('Simulation reset to default demo: Lap 31 Madrid');
    setTimeout(() => setEventToast(null), 4000);
  };

  const handleToggleSC = () => {
    const isSC = params.safetyCar === 'full_sc';
    handleUpdateParams({
      safetyCar: isSC ? 'none' : 'full_sc',
      scLapsRemaining: isSC ? 0 : 2,
    });
    setEventToast(
      isSC
        ? 'Safety Car withdrawn. Green-flag pit stop loss of 21.5s restored.'
        : 'Safety Car deployed! Pit stop loss reduced to 10.4s (saves 11.1s).'
    );
    setTimeout(() => setEventToast(null), 4500);
  };

  const handleApplyWhatIfEvent = (
    newParams: Partial<SimulationParams>,
    explanation: string
  ) => {
    handleUpdateParams(newParams);
    setEventToast(explanation);
    setTimeout(() => setEventToast(null), 6000);
  };

  return (
    <div className="min-h-screen bg-[#101214] text-[#F2F0EA] flex flex-col font-sans selection:bg-[#FF4438]/30 selection:text-white">
      {/* 1. COMPACT HEADER */}
      <TopBar
        params={params}
        onUpdateParams={handleUpdateParams}
        onSelectPreset={handleSelectPreset}
        onReset={handleReset}
        onOpenSimulation={() => setIsSimulationOpen(true)}
        onOpenWhatIf={() => setIsWhatIfOpen(true)}
        activePresetId={activePresetId}
      />

      {/* Floating Animated Event Feedback Banner */}
      {eventToast && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4 animate-in slide-in-from-top duration-200">
          <div className="flex items-center gap-2.5 rounded-lg border border-[#D9F36A] bg-[#16181D]/95 backdrop-blur-md p-3 shadow-2xl font-mono text-xs text-white">
            <Zap className="h-4 w-4 text-[#D9F36A] shrink-0 fill-[#D9F36A]" />
            <span className="flex-1">{eventToast}</span>
            <button
              onClick={() => setEventToast(null)}
              className="text-[#8E95A0] hover:text-white ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Workstation Container */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-3 sm:p-5 space-y-4">
        {/* 2. MAIN RACE SITUATION SUMMARY (5-Second Comprehension) */}
        <RaceSituationBanner
          params={params}
          onOpenWhatIf={() => setIsWhatIfOpen(true)}
          onToggleSC={handleToggleSC}
        />

        {/* 3. CORE DECISION STAGE: Circuit Visualization & Recommendation Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Main Circuit Schematic (7 cols) */}
          <div className="lg:col-span-7">
            <CircuitStage params={params} onDeploySC={handleToggleSC} />
          </div>

          {/* Beside the circuit: The Main Recommendation Panel (5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <RecommendationPanel engineOutput={engineOutput} />
          </div>
        </div>

        {/* 4. THE STRATEGY WAR ROOM: Three Strategy Choices (Side-by-Side) */}
        <div>
          <StrategyWarRoom engineOutput={engineOutput} />
        </div>

        {/* 5. VISUAL ANALYTICS: Strategy Comparison Horizontal Bar Chart */}
        <div>
          <StrategyBarChart engineOutput={engineOutput} />
        </div>

        {/* 6. COLLAPSIBLE ADVANCED DETAILS SECTION */}
        <div className="rounded-lg border border-[#262A30] bg-[#14171A] overflow-hidden shadow-xl">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between p-3.5 hover:bg-[#191C20] transition-colors text-left font-mono"
          >
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-[#D9F36A]" />
              <span className="font-display text-xs sm:text-sm font-bold text-white tracking-wider">
                ADVANCED TECHNICAL DETAILS & RACE ENGINEER TELEMETRY
              </span>
              <span className="hidden sm:inline rounded bg-[#22262C] px-2 py-0.5 text-[10px] text-[#8E95A0]">
                {showAdvanced ? 'CLICK TO COLLAPSE' : 'CLICK TO EXPAND'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#8E95A0]">
              <span className="text-[11px]">
                {showAdvanced ? 'Hide Secondary Details' : 'Show Secondary Details'}
              </span>
              {showAdvanced ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </button>

          {showAdvanced && (
            <div className="p-4 border-t border-[#262A30] space-y-4 animate-in fade-in duration-200">
              {/* Timeline */}
              <RaceTimeline params={params} engineOutput={engineOutput} />

              {/* Grid: Engineer Sliders + Tyre Degradation Line Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-6">
                  <EngineerControlPanel
                    params={params}
                    onUpdateParams={handleUpdateParams}
                  />
                </div>
                <div className="lg:col-span-6">
                  <AnalyticsCharts engineOutput={engineOutput} />
                </div>
              </div>

              {/* Grid: Event Log + Disclosures */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-8">
                  <EventLog events={events} onClear={() => setEvents([])} />
                </div>
                <div className="lg:col-span-4 rounded-lg border border-[#262A30] bg-[#16181D] p-4 font-mono text-xs shadow-xl flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 border-b border-[#262A30] pb-2 mb-2">
                      <ShieldAlert className="h-4 w-4 text-[#8E95A0]" />
                      <h4 className="font-display font-bold text-white text-xs">
                        MODEL SPECIFICATION & TRANSPARENCY
                      </h4>
                    </div>
                    <div className="space-y-1.5 text-[10px] text-[#A0A8B4] leading-relaxed">
                      <div>• Circuit: Circuito de Madring (Official 5.414 km F1 layout, 22 corners, 24% banked curve at Turn 12).</div>
                      <div>• Base dry lap time: 76.5s. Base wet lap time: 88.0s.</div>
                      <div>• Pit stop loss: 21.5s under green flag vs 10.4s under Safety Car (saves 11.1s).</div>
                      <div>• Pure deterministic mathematics; all displayed numbers calculated in real time.</div>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-[#262A30] text-[10px] text-[#656E7B] flex justify-between">
                    <span>ZERO HOUR MVP</span>
                    <span className="text-[#D9F36A] font-bold">100% CLIENT-SIDE</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#262A30] bg-[#121417] px-6 py-2.5 text-center text-xs font-mono text-[#656E7B]">
        <span>PITWALL AI — MADRID MADRING EDITION</span>
        <span className="mx-2">•</span>
        <span>EVERY SECOND IS A DECISION</span>
        <span className="mx-2">•</span>
        <span>ZERO HOUR HACKATHON BUILD</span>
      </footer>

      {/* Signature Feature: What-If Strategy Simulator Modal */}
      <WhatIfSimulatorModal
        isOpen={isWhatIfOpen}
        onClose={() => setIsWhatIfOpen(false)}
        params={params}
        onApplyEvent={handleApplyWhatIfEvent}
      />

      {/* Simulation Playback Modal */}
      <SimulationModal
        isOpen={isSimulationOpen}
        onClose={() => setIsSimulationOpen(false)}
        engineOutput={engineOutput}
        params={params}
      />
    </div>
  );
}
