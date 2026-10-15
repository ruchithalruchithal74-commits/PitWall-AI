import React, { useState } from 'react';
import { Activity, BarChart2, Info, TrendingDown } from 'lucide-react';
import { SimulationEngineOutput } from '../types/telemetry';

interface AnalyticsChartsProps {
  engineOutput: SimulationEngineOutput;
}

export const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({
  engineOutput,
}) => {
  const [activeTab, setActiveTab] = useState<'delta' | 'degradation'>('delta');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const { deltaAnalysis, strategies } = engineOutput;
  const { pit_now, stay_out, wait_for_rain } = strategies;

  // Chart dimensions
  const width = 740;
  const height = 230;
  const padding = { top: 25, right: 30, bottom: 35, left: 50 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const totalPoints = deltaAnalysis.length;

  // Calculate scales for Chart 1: STRATEGY DELTA
  const maxDelta = Math.max(
    ...deltaAnalysis.flatMap((d) => [
      d.pitNowDelta,
      d.stayOutDelta,
      d.waitForRainDelta,
    ]),
    8
  );

  const getX = (idx: number) => padding.left + (idx / Math.max(1, totalPoints - 1)) * chartW;
  const getYDelta = (val: number) =>
    padding.top + chartH - (Math.min(val, maxDelta) / maxDelta) * chartH;

  // Paths for Strategy Delta
  const pitNowPath = deltaAnalysis
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)},${getYDelta(d.pitNowDelta).toFixed(1)}`)
    .join(' ');

  const stayOutPath = deltaAnalysis
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)},${getYDelta(d.stayOutDelta).toFixed(1)}`)
    .join(' ');

  const waitPath = deltaAnalysis
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)},${getYDelta(d.waitForRainDelta).toFixed(1)}`)
    .join(' ');

  // Calculate scales for Chart 2: TYRE DEGRADATION & LAP TIMES
  const allLapTimes = [
    ...pit_now.lapBreakdown.map((l) => l.lapTime),
    ...stay_out.lapBreakdown.map((l) => l.lapTime),
    ...wait_for_rain.lapBreakdown.map((l) => l.lapTime),
  ].filter((t) => t < 120); // filter out pure pit lap spikes for clean scale

  const minLapTime = Math.min(...allLapTimes, 76);
  const maxLapTime = Math.max(...allLapTimes, 92);

  const getYLapTime = (val: number) => {
    const clamped = Math.max(minLapTime, Math.min(val, maxLapTime));
    return (
      padding.top +
      chartH -
      ((clamped - minLapTime) / (maxLapTime - minLapTime)) * chartH
    );
  };

  const pitLapTimesPath = pit_now.lapBreakdown
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)},${getYLapTime(d.lapTime).toFixed(1)}`)
    .join(' ');

  const stayLapTimesPath = stay_out.lapBreakdown
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)},${getYLapTime(d.lapTime).toFixed(1)}`)
    .join(' ');

  const waitLapTimesPath = wait_for_rain.lapBreakdown
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i).toFixed(1)},${getYLapTime(d.lapTime).toFixed(1)}`)
    .join(' ');

  const currentHoverItem = hoverIndex !== null ? deltaAnalysis[hoverIndex] : null;

  return (
    <div className="rounded-lg border border-[#262A30] bg-[#16181D] p-4 shadow-xl">
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#262A30] pb-3 mb-3">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-[#D9F36A]" />
          <h3 className="font-display text-sm font-bold tracking-wider text-white">
            STRATEGY TELEMETRY ANALYTICS
          </h3>
        </div>

        {/* Chart toggle buttons */}
        <div className="flex items-center gap-1 rounded bg-[#121417] p-1 border border-[#262A30] font-mono text-xs">
          <button
            onClick={() => setActiveTab('delta')}
            className={`rounded px-3 py-1 font-bold transition-all ${
              activeTab === 'delta'
                ? 'bg-[#2E343D] text-white shadow'
                : 'text-[#8E95A0] hover:text-white'
            }`}
          >
            1. STRATEGY DELTA (TIME GAP)
          </button>
          <button
            onClick={() => setActiveTab('degradation')}
            className={`rounded px-3 py-1 font-bold transition-all ${
              activeTab === 'degradation'
                ? 'bg-[#2E343D] text-white shadow'
                : 'text-[#8E95A0] hover:text-white'
            }`}
          >
            2. TYRE DEGRADATION & PACE
          </button>
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[620px] select-none"
        >
          {/* Grid lines */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={width - padding.right}
            y2={padding.top}
            stroke="#262A30"
            strokeDasharray="3 3"
          />
          <line
            x1={padding.left}
            y1={padding.top + chartH * 0.5}
            x2={width - padding.right}
            y2={padding.top + chartH * 0.5}
            stroke="#262A30"
            strokeDasharray="3 3"
          />
          <line
            x1={padding.left}
            y1={padding.top + chartH}
            x2={width - padding.right}
            y2={padding.top + chartH}
            stroke="#383E48"
          />

          {/* Y Axis Labels */}
          {activeTab === 'delta' ? (
            <>
              <text
                x={padding.left - 8}
                y={padding.top + 4}
                fill="#8E95A0"
                fontSize="9"
                fontFamily="JetBrains Mono"
                textAnchor="end"
              >
                +{maxDelta.toFixed(0)}s
              </text>
              <text
                x={padding.left - 8}
                y={padding.top + chartH * 0.5 + 3}
                fill="#8E95A0"
                fontSize="9"
                fontFamily="JetBrains Mono"
                textAnchor="end"
              >
                +{(maxDelta * 0.5).toFixed(0)}s
              </text>
              <text
                x={padding.left - 8}
                y={padding.top + chartH + 3}
                fill="#8E95A0"
                fontSize="9"
                fontFamily="JetBrains Mono"
                textAnchor="end"
              >
                0.0s (Lead)
              </text>
            </>
          ) : (
            <>
              <text
                x={padding.left - 8}
                y={padding.top + 4}
                fill="#8E95A0"
                fontSize="9"
                fontFamily="JetBrains Mono"
                textAnchor="end"
              >
                {maxLapTime.toFixed(1)}s
              </text>
              <text
                x={padding.left - 8}
                y={padding.top + chartH * 0.5 + 3}
                fill="#8E95A0"
                fontSize="9"
                fontFamily="JetBrains Mono"
                textAnchor="end"
              >
                {((maxLapTime + minLapTime) / 2).toFixed(1)}s
              </text>
              <text
                x={padding.left - 8}
                y={padding.top + chartH + 3}
                fill="#8E95A0"
                fontSize="9"
                fontFamily="JetBrains Mono"
                textAnchor="end"
              >
                {minLapTime.toFixed(1)}s
              </text>
            </>
          )}

          {/* X Axis Lap Labels */}
          {deltaAnalysis.map((d, i) => {
            if (i % 4 === 0 || i === totalPoints - 1) {
              return (
                <text
                  key={d.lap}
                  x={getX(i)}
                  y={height - 12}
                  fill="#8E95A0"
                  fontSize="9"
                  fontFamily="JetBrains Mono"
                  textAnchor="middle"
                >
                  L{d.lap}
                </text>
              );
            }
            return null;
          })}

          {/* Paths based on active tab */}
          {activeTab === 'delta' ? (
            <>
              {/* STAY OUT line */}
              <path
                d={stayOutPath}
                fill="none"
                stroke="#FFD700"
                strokeWidth="2.5"
                strokeDasharray="4 2"
                className="opacity-80"
              />
              {/* WAIT FOR RAIN line */}
              <path
                d={waitPath}
                fill="none"
                stroke="#39D353"
                strokeWidth="2.5"
                className="opacity-90"
              />
              {/* PIT NOW line */}
              <path
                d={pitNowPath}
                fill="none"
                stroke="#D9F36A"
                strokeWidth="3"
              />
            </>
          ) : (
            <>
              {/* Degradation Pace lines */}
              <path
                d={stayLapTimesPath}
                fill="none"
                stroke="#FFD700"
                strokeWidth="2"
                strokeDasharray="4 2"
                className="opacity-80"
              />
              <path
                d={waitLapTimesPath}
                fill="none"
                stroke="#39D353"
                strokeWidth="2"
                className="opacity-90"
              />
              <path
                d={pitLapTimesPath}
                fill="none"
                stroke="#D9F36A"
                strokeWidth="2.5"
              />
            </>
          )}

          {/* Hover interactive vertical line and points */}
          {deltaAnalysis.map((d, i) => (
            <rect
              key={d.lap}
              x={getX(i) - 6}
              y={padding.top}
              width="12"
              height={chartH}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoverIndex(i)}
            />
          ))}

          {hoverIndex !== null && (
            <line
              x1={getX(hoverIndex)}
              y1={padding.top}
              x2={getX(hoverIndex)}
              y2={padding.top + chartH}
              stroke="#F2F0EA"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
          )}
        </svg>
      </div>

      {/* Chart Legend & Live Inspector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#262A30] pt-2.5 font-mono text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#D9F36A]" />
            <span className="text-white font-bold text-[11px]">PIT NOW</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#FFD700]" />
            <span className="text-[#FFD700] text-[11px]">STAY OUT</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#39D353]" />
            <span className="text-[#39D353] text-[11px]">WAIT FOR RAIN</span>
          </div>
        </div>

        {/* Live Hover Inspection Readout */}
        {currentHoverItem ? (
          <div className="flex items-center gap-3 text-[11px] bg-[#121417] px-2.5 py-1 rounded border border-[#2E343D]">
            <span className="text-white font-bold">
              LAP {currentHoverItem.lap}:
            </span>
            <span className="text-[#D9F36A]">
              Pit Now: +{currentHoverItem.pitNowDelta}s
            </span>
            <span className="text-[#FFD700]">
              Stay Out: +{currentHoverItem.stayOutDelta}s
            </span>
            <span className="text-[#39D353]">
              Wait: +{currentHoverItem.waitForRainDelta}s
            </span>
          </div>
        ) : (
          <div className="text-[10px] text-[#8E95A0]">
            Hover over chart to inspect lap-by-lap telemetry gaps
          </div>
        )}
      </div>
    </div>
  );
};
