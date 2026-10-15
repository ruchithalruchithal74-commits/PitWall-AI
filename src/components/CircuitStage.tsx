import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CloudRain,
  Compass,
  Gauge,
  Info,
  Maximize2,
  Wind,
} from 'lucide-react';
import {
  DEFAULT_CAR_POSITION,
  MADRING_METADATA,
  MADRING_PATH_MAIN,
  MADRING_PATH_PITLANE,
  MADRING_SECTORS,
  MADRING_TUNNEL_1,
  MADRING_TUNNEL_2,
  MADRING_TURNS,
  SC_INCIDENT_COORDS,
  START_FINISH_LINE,
  TurnMarker,
} from '../data/madringCircuit';
import { SimulationParams } from '../types/telemetry';

interface CircuitStageProps {
  params: SimulationParams;
  onDeploySC: () => void;
}

export const CircuitStage: React.FC<CircuitStageProps> = ({
  params,
  onDeploySC,
}) => {
  const [selectedTurn, setSelectedTurn] = useState<TurnMarker | null>(null);
  const [telemetrySpeed, setTelemetrySpeed] = useState(DEFAULT_CAR_POSITION.currentSpeedKmh);

  const isSC = params.safetyCar === 'full_sc';
  const isVSC = params.safetyCar === 'vsc';
  const isRain = params.rainProbability >= 45;

  // Gentle telemetry fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetrySpeed((prev) => {
        const base = isSC ? 138 : 316;
        const jitter = Math.floor(Math.sin(Date.now() / 400) * 7);
        return base + jitter;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [isSC]);

  return (
    <div className="relative flex flex-col rounded-lg border border-[#262A30] bg-[#16181D] overflow-hidden shadow-2xl h-full">
      {/* Circuit Header Strip */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#262A30] bg-[#131518] px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#D9F36A] animate-pulse" />
            <h2 className="font-display text-sm font-bold tracking-wider text-white">
              CIRCUITO DE MADRING — OFFICIAL REAL F1 LAYOUT
            </h2>
          </div>
          <span className="rounded bg-[#22262C] px-2 py-0.5 text-[10px] font-mono text-[#8E95A0] border border-[#2E343D]">
            5.414 KM • 22 CORNERS • STUDIO DROMO
          </span>
        </div>

        {/* Live Status Indicators */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div
            className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-[11px] border ${
              isRain
                ? 'border-blue-500/40 bg-blue-500/10 text-blue-400'
                : 'border-[#262A30] bg-[#1C2026] text-[#A0A8B4]'
            }`}
          >
            <CloudRain className="h-3 w-3" />
            <span>
              {params.rainProbability}% RAIN ({params.trackTempC}°C TRACK)
            </span>
          </div>

          {isSC && (
            <div className="flex items-center gap-1 rounded border border-[#FF4438]/50 bg-[#FF4438]/20 px-2.5 py-1 text-[11px] text-[#FF4438] animate-pulse">
              <AlertTriangle className="h-3 w-3" />
              <span className="font-bold">SC: T12 LA MONUMENTAL</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Track Graphic Canvas */}
      <div className="relative flex-1 min-h-[380px] lg:min-h-[460px] bg-gradient-to-b from-[#131518] to-[#0F1114] p-3 flex items-center justify-center">
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#383E48 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* Rain particles overlay if rain probability is substantial */}
        {params.rainProbability > 30 && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
            <div className="w-full h-full bg-[linear-gradient(135deg,rgba(56,189,248,0.15)_1px,transparent_1px)] bg-[length:18px_18px]" />
          </div>
        )}

        {/* SVG Track Schematic - Real Official Geometry */}
        <svg
          viewBox="0 0 205 138"
          className="w-full h-full max-h-[460px] drop-shadow-2xl select-none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="realTrackGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="0.8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="realBeaconGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <linearGradient id="realSectorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D9F36A" />
              <stop offset="45%" stopColor="#38BDF8" />
              <stop offset="85%" stopColor="#FF4438" />
            </linearGradient>

            <pattern id="realChequer" width="2" height="2" patternUnits="userSpaceOnUse">
              <rect width="1" height="1" fill="#ffffff" />
              <rect x="1" width="1" height="1" fill="#101214" />
              <rect y="1" width="1" height="1" fill="#101214" />
              <rect x="1" y="1" width="1" height="1" fill="#ffffff" />
            </pattern>
          </defs>

          {/* Real Track Group with official translation */}
          <g transform="translate(-4.8232766,-6.304211)">
            {/* Asphalt underlayer */}
            <path
              d={MADRING_PATH_MAIN}
              fill="none"
              stroke="#1B1F24"
              strokeWidth="7.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Track boundary kerbing */}
            <path
              d={MADRING_PATH_MAIN}
              fill="none"
              stroke="#2B313A"
              strokeWidth="4.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Pit lane along Avenida del Partenon */}
            <path
              d={MADRING_PATH_PITLANE}
              fill="none"
              stroke="#4E5564"
              strokeWidth="1.4"
              strokeDasharray="1.2 0.8"
              strokeLinecap="round"
            />

            {/* Racing line with sector glow */}
            <path
              d={MADRING_PATH_MAIN}
              fill="none"
              stroke="url(#realSectorGrad)"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#realTrackGlow)"
              className="opacity-95"
            />

            {/* Tunnels passing under M-11 Motorway */}
            {/* Tunnel 1 (IFEMA -> Valdebebas) */}
            <path
              d={MADRING_TUNNEL_1}
              fill="#383E48"
              stroke="#687385"
              strokeWidth="0.4"
              className="opacity-90"
            />
            {/* Tunnel 2 (Valdebebas -> IFEMA return) */}
            <path
              d={MADRING_TUNNEL_2}
              fill="#383E48"
              stroke="#687385"
              strokeWidth="0.4"
              className="opacity-90"
            />

            {/* Start / Finish Line */}
            <line
              x1={START_FINISH_LINE.x1}
              y1={START_FINISH_LINE.y1}
              x2={START_FINISH_LINE.x2}
              y2={START_FINISH_LINE.y2}
              stroke="url(#realChequer)"
              strokeWidth="1.8"
            />
            <text
              x={START_FINISH_LINE.x1 - 2}
              y={START_FINISH_LINE.y1 - 3}
              fill="#F2F0EA"
              fontSize="2.8"
              fontFamily="JetBrains Mono"
              fontWeight="bold"
            >
              START / FINISH
            </text>

            {/* Turn Markers 1 to 22 */}
            {MADRING_TURNS.map((turn) => {
              const isMonumental = turn.number === 12;
              const isHovered = selectedTurn?.number === turn.number;

              return (
                <g
                  key={turn.number}
                  className="cursor-pointer transition-transform"
                  onClick={() => setSelectedTurn(turn)}
                  onMouseEnter={() => setSelectedTurn(turn)}
                >
                  {/* Glowing ring for 24% Banked Curve at Turn 12 */}
                  {isMonumental && (
                    <circle
                      cx={turn.x}
                      cy={turn.y}
                      r="5.2"
                      fill="none"
                      stroke="#38BDF8"
                      strokeWidth="0.5"
                      strokeDasharray="1.2 0.8"
                      className="animate-spin"
                      style={{ animationDuration: '6s' }}
                    />
                  )}

                  {/* Marker Dot */}
                  <circle
                    cx={turn.x}
                    cy={turn.y}
                    r={isMonumental ? 3.0 : isHovered ? 2.6 : 2.0}
                    fill={isMonumental ? '#0284C7' : isHovered ? '#D9F36A' : '#191C20'}
                    stroke={isMonumental ? '#38BDF8' : '#8E95A0'}
                    strokeWidth="0.4"
                  />
                  <text
                    x={turn.x}
                    y={turn.y + 0.9}
                    fill={isHovered ? '#000000' : '#F2F0EA'}
                    fontSize="1.9"
                    fontFamily="JetBrains Mono"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {turn.number}
                  </text>
                </g>
              );
            })}

            {/* Safety Car Incident Beacon at Turn 12/13 (Exit of La Monumental) */}
            {isSC && (
              <g
                transform={`translate(${SC_INCIDENT_COORDS.x}, ${SC_INCIDENT_COORDS.y})`}
                className="cursor-pointer"
                onClick={onDeploySC}
              >
                <circle
                  r="5.5"
                  fill="none"
                  stroke="#FF4438"
                  strokeWidth="0.6"
                  className="animate-ping opacity-70"
                />
                <circle r="2.4" fill="#FF4438" stroke="#FFFFFF" strokeWidth="0.3" />
                <rect
                  x="-12"
                  y="-8"
                  width="24"
                  height="4.8"
                  rx="1"
                  fill="#FF4438"
                  className="drop-shadow"
                />
                <text
                  x="0"
                  y="-4.6"
                  fill="#000000"
                  fontSize="2.1"
                  fontFamily="JetBrains Mono"
                  fontWeight="900"
                  textAnchor="middle"
                >
                  ⚠️ SC INCIDENT
                </text>
              </g>
            )}

            {/* Driver Car Position Marker (Car #4 - P3) in Sector 2 */}
            <g
              transform={`translate(${DEFAULT_CAR_POSITION.x}, ${DEFAULT_CAR_POSITION.y})`}
              filter="url(#realBeaconGlow)"
            >
              <circle
                r="4.5"
                fill="none"
                stroke="#D9F36A"
                strokeWidth="0.5"
                className="animate-car-beacon"
              />
              <circle r="1.8" fill="#D9F36A" stroke="#101214" strokeWidth="0.5" />
              <rect
                x="3"
                y="-3.5"
                width="14"
                height="5"
                rx="0.8"
                fill="#101214"
                stroke="#D9F36A"
                strokeWidth="0.3"
              />
              <text
                x="10"
                y="0"
                fill="#D9F36A"
                fontSize="2.4"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
                textAnchor="middle"
              >
                #4 P3
              </text>
            </g>

            {/* Key Circuit Section Callout Badges */}
            {/* 1. La Monumental 24% Banked Curve */}
            <g transform="translate(162, 54)">
              <rect
                width="40"
                height="6.5"
                rx="1"
                fill="#16181D"
                stroke="#38BDF8"
                strokeWidth="0.4"
              />
              <text
                x="20"
                y="4.5"
                fill="#38BDF8"
                fontSize="2.4"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
                textAnchor="middle"
              >
                T12 LA MONUMENTAL (24%)
              </text>
            </g>

            {/* 2. Subida de las Carcavas */}
            <g transform="translate(74, 38)">
              <rect
                width="32"
                height="5.5"
                rx="1"
                fill="#16181D"
                stroke="#D9F36A"
                strokeWidth="0.3"
              />
              <text
                x="16"
                y="3.8"
                fill="#D9F36A"
                fontSize="2.0"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
                textAnchor="middle"
              >
                T5-T6 CÁRCAVAS (8% CLIMB)
              </text>
            </g>

            {/* 3. M-11 Tunnels Annotation */}
            <g transform="translate(102, 18)">
              <text
                x="0"
                y="0"
                fill="#8E95A0"
                fontSize="2.0"
                fontFamily="JetBrains Mono"
              >
                TUNNEL 1 (M-11)
              </text>
            </g>
            <g transform="translate(108, 64)">
              <text
                x="0"
                y="0"
                fill="#8E95A0"
                fontSize="2.0"
                fontFamily="JetBrains Mono"
              >
                TUNNEL 2 (M-11)
              </text>
            </g>

            {/* 4. IFEMA Paddock & Pit straight */}
            <g transform="translate(8, 110)">
              <rect
                width="36"
                height="5.5"
                rx="1"
                fill="#16181D"
                stroke="#8E95A0"
                strokeWidth="0.3"
              />
              <text
                x="18"
                y="3.8"
                fill="#E2E8F0"
                fontSize="2.0"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
                textAnchor="middle"
              >
                IFEMA PIT & PADDOCK
              </text>
            </g>
          </g>
        </svg>

        {/* Selected Corner Tooltip Inspector */}
        {selectedTurn && (
          <div className="absolute top-3 left-3 z-20 max-w-xs rounded border border-[#3A404A] bg-[#191C20]/95 backdrop-blur-md p-3 shadow-xl font-mono">
            <div className="flex items-center justify-between gap-2 border-b border-[#262A30] pb-1.5 mb-1.5">
              <span className="font-display font-bold text-white text-xs">
                TURN {selectedTurn.number}: {selectedTurn.name}
              </span>
              <button
                onClick={() => setSelectedTurn(null)}
                className="text-xs text-[#8E95A0] hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1 text-[10px] text-[#A0A8B4]">
              <div>Sector: {selectedTurn.sector} ({MADRING_SECTORS[selectedTurn.sector - 1].name})</div>
              <div>Type: {selectedTurn.type.replace('_', ' ').toUpperCase()}</div>
              {selectedTurn.number === 12 && (
                <div className="text-[#38BDF8] font-bold">
                  ★ Signature 550m curve with 24% banking & 4G lateral load!
                </div>
              )}
              {selectedTurn.number === 5 && (
                <div className="text-[#D9F36A] font-bold">
                  ★ Subida de las Cárcavas: 8% steep uphill climb toward Tunnel 1
                </div>
              )}
              {selectedTurn.number === 13 && isSC && (
                <div className="text-[#FF4438] font-bold">
                  ⚠️ Current Safety Car incident point (Stranded Car)
                </div>
              )}
            </div>
          </div>
        )}

        {/* Small Authentic Circuit Legend */}
        <div className="absolute bottom-3 left-3 z-10 flex flex-wrap items-center gap-3 rounded border border-[#2E343D] bg-[#14171A]/95 backdrop-blur-md px-3 py-1.5 font-mono text-[10px]">
          <span className="text-[#8E95A0] font-bold">MADRING SECTORS:</span>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#D9F36A]" />
            <span className="text-white">S1 (IFEMA Street • T1-T6)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#38BDF8]" />
            <span className="text-white">S2 (La Monumental • T7-T13)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-[#FF4438]" />
            <span className="text-white">S3 (Las Enlazadas • T14-T22)</span>
          </div>
        </div>

        {/* Mini Speed & Delta Telemetry Pill */}
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-3 rounded border border-[#2E343D] bg-[#14171A]/95 backdrop-blur-md px-3 py-1.5 font-mono text-xs">
          <div className="flex items-center gap-1.5">
            <Gauge className="h-3.5 w-3.5 text-[#D9F36A]" />
            <span className="text-white font-bold font-display">
              {telemetrySpeed} <span className="text-[10px] text-[#8E95A0]">KM/H</span>
            </span>
          </div>
          <div className="h-3 w-px bg-[#262A30]" />
          <div className="text-[10px]">
            <span className="text-[#8E95A0]">GAP TO P2: </span>
            <span className="text-white font-bold">+1.42s</span>
          </div>
        </div>
      </div>

      {/* Sector Details Rail */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#262A30] border-t border-[#262A30] bg-[#14171A] text-xs font-mono">
        {MADRING_SECTORS.map((sector) => (
          <div key={sector.id} className="p-2.5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: sector.color }}
                />
                <span className="font-bold text-white text-[11px]">
                  {sector.name}
                </span>
              </div>
              <p className="text-[10px] text-[#8E95A0] truncate max-w-[200px]">
                {sector.description}
              </p>
            </div>
            <div className="text-right">
              <div className="text-[9px] text-[#8E95A0]">TURNS</div>
              <div className="font-bold text-[#F2F0EA] font-display text-[11px]">
                {sector.turnRange}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
