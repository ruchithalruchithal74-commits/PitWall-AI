import React from 'react';
import { AlertTriangle, CloudRain, Flame, Gauge, ShieldAlert, Zap } from 'lucide-react';
import { SimulationParams } from '../types/telemetry';

interface RaceSituationBannerProps {
  params: SimulationParams;
  onOpenWhatIf: () => void;
  onToggleSC: () => void;
}

export const RaceSituationBanner: React.FC<RaceSituationBannerProps> = ({
  params,
  onOpenWhatIf,
  onToggleSC,
}) => {
  const isSC = params.safetyCar === 'full_sc';
  const isVSC = params.safetyCar === 'vsc';

  // Plain language descriptors
  const getWearLabel = (wear: number) => {
    if (wear >= 72) return { text: 'CRITICAL (HIGH)', desc: 'Losing grip rapidly; pit stop urgent' };
    if (wear >= 60) return { text: 'HIGH', desc: 'Degradation active; tyres wearing down' };
    if (wear >= 35) return { text: 'MODERATE', desc: 'Tyres in working temperature window' };
    return { text: 'LOW (FRESH)', desc: 'Optimal grip; minimal lap-time loss' };
  };

  const getRainLabel = (rain: number) => {
    if (rain >= 70) return { text: 'HIGH', desc: 'Rain storm imminent in ~3 laps' };
    if (rain >= 45) return { text: 'MODERATE', desc: 'Radar shows incoming showers' };
    if (rain >= 20) return { text: 'LOW', desc: 'Light mist possible; track mostly dry' };
    return { text: 'DRY (0%)', desc: 'No precipitation detected on radar' };
  };

  const wearInfo = getWearLabel(params.tyreWear);
  const rainInfo = getRainLabel(params.rainProbability);

  // Dynamic plain language summary statement
  let situationHeadline = 'YOUR DRIVER IS P3. TYRE WEAR IS HIGH. RAIN IS APPROACHING.';
  if (!isSC && params.rainProbability < 30) {
    situationHeadline = 'YOUR DRIVER IS P3. TRACK IS DRY. TYRE LIFE IS RUNNING OUT.';
  } else if (!isSC && params.rainProbability >= 60) {
    situationHeadline = 'YOUR DRIVER IS P3. RAIN APPROACHING ON A GREEN TRACK.';
  } else if (isSC && params.rainProbability < 30) {
    situationHeadline = 'YOUR DRIVER IS P3. SAFETY CAR ACTIVE IN DRY RACE CONDITIONS.';
  }

  return (
    <div className="rounded-lg border border-[#262A30] bg-[#16181D] p-3.5 sm:p-4 shadow-xl">
      {/* 5-Second Comprehension Headline */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#262A30] pb-3 mb-3">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-[#8E95A0]">
            CURRENT RACE OVERVIEW • 5-SECOND SITUATION SUMMARY
          </div>
          <h2 className="font-display text-base sm:text-xl font-black text-white tracking-wide mt-0.5">
            {situationHeadline}
          </h2>
        </div>

        {/* Action button to test events */}
        <button
          onClick={onOpenWhatIf}
          className="flex items-center gap-2 rounded bg-[#D9F36A] px-3.5 py-1.5 text-xs font-mono font-bold text-black hover:bg-[#c9e557] active:scale-95 transition-all shadow-md shadow-[#D9F36A]/10"
        >
          <Zap className="h-4 w-4 fill-black" />
          <span>SIMULATE A RACE EVENT</span>
        </button>
      </div>

      {/* Three Plain-Language Key Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
        {/* Indicator 1: Tyre Wear */}
        <div className="rounded border border-[#2E343D] bg-[#131518] p-2.5">
          <div className="flex items-center justify-between text-xs text-[#8E95A0] mb-1">
            <span className="flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-[#FF4438]" />
              <span>TYRE WEAR</span>
            </span>
            <span
              className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                params.tyreWear >= 60
                  ? 'bg-[#FF4438]/20 text-[#FF4438]'
                  : 'bg-yellow-500/20 text-yellow-300'
              }`}
            >
              {wearInfo.text}
            </span>
          </div>
          <div className="font-display text-2xl font-bold text-white">
            {params.tyreWear}%
          </div>
          <p className="text-[10px] text-[#A0A8B4] mt-0.5 truncate">
            {wearInfo.desc}
          </p>
        </div>

        {/* Indicator 2: Rain Probability */}
        <div className="rounded border border-[#2E343D] bg-[#131518] p-2.5">
          <div className="flex items-center justify-between text-xs text-[#8E95A0] mb-1">
            <span className="flex items-center gap-1.5">
              <CloudRain className="h-3.5 w-3.5 text-blue-400" />
              <span>RAIN PROBABILITY</span>
            </span>
            <span
              className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                params.rainProbability >= 60
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'bg-zinc-800 text-zinc-300'
              }`}
            >
              {rainInfo.text}
            </span>
          </div>
          <div className="font-display text-2xl font-bold text-white">
            {params.rainProbability}%
          </div>
          <p className="text-[10px] text-[#A0A8B4] mt-0.5 truncate">
            {rainInfo.desc}
          </p>
        </div>

        {/* Indicator 3: Safety Car Status */}
        <div
          onClick={onToggleSC}
          className="rounded border border-[#2E343D] bg-[#131518] p-2.5 cursor-pointer hover:border-[#4A5260] transition-colors"
          title="Click to toggle Safety Car"
        >
          <div className="flex items-center justify-between text-xs text-[#8E95A0] mb-1">
            <span className="flex items-center gap-1.5">
              <AlertTriangle
                className={`h-3.5 w-3.5 ${isSC ? 'text-[#FF4438]' : 'text-emerald-400'}`}
              />
              <span>SAFETY CAR</span>
            </span>
            <span
              className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                isSC
                  ? 'bg-[#FF4438]/20 text-[#FF4438] animate-pulse'
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {isSC ? 'DEPLOYED' : isVSC ? 'VSC ACTIVE' : 'GREEN TRACK'}
            </span>
          </div>
          <div
            className={`font-display text-2xl font-bold ${
              isSC ? 'text-[#FF4438]' : 'text-emerald-400'
            }`}
          >
            {isSC ? 'CHEAP PIT STOP' : 'FULL PIT LOSS'}
          </div>
          <p className="text-[10px] text-[#A0A8B4] mt-0.5 truncate">
            {isSC
              ? 'Pack slowed; stopping costs ~10.4s (saves 11.1s)'
              : 'Cars at full race pace; pit stop costs 21.5s'}
          </p>
        </div>
      </div>
    </div>
  );
};
