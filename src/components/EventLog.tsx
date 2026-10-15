import React from 'react';
import {
  AlertTriangle,
  Clock,
  CloudRain,
  Flag,
  Radio,
  Sliders,
  Terminal,
} from 'lucide-react';
import { EventLogItem } from '../types/telemetry';

interface EventLogProps {
  events: EventLogItem[];
  onClear?: () => void;
}

export const EventLog: React.FC<EventLogProps> = ({ events, onClear }) => {
  const getIcon = (type: EventLogItem['type']) => {
    switch (type) {
      case 'sc':
        return <AlertTriangle className="h-3.5 w-3.5 text-[#FF4438]" />;
      case 'weather':
        return <CloudRain className="h-3.5 w-3.5 text-blue-400" />;
      case 'strategy':
        return <Sliders className="h-3.5 w-3.5 text-[#D9F36A]" />;
      case 'tyre':
        return <Flag className="h-3.5 w-3.5 text-amber-400" />;
      case 'radio':
        return <Radio className="h-3.5 w-3.5 text-[#A0A8B4]" />;
      default:
        return <Terminal className="h-3.5 w-3.5 text-zinc-400" />;
    }
  };

  const getSeverityBadge = (sev: EventLogItem['severity']) => {
    switch (sev) {
      case 'critical':
        return 'text-[#FF4438] bg-[#FF4438]/10 border-[#FF4438]/30';
      case 'alert':
        return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
      case 'warning':
        return 'text-yellow-300 bg-yellow-300/10 border-yellow-300/30';
      case 'info':
      default:
        return 'text-zinc-400 bg-zinc-800/40 border-zinc-700';
    }
  };

  return (
    <div className="rounded-lg border border-[#262A30] bg-[#16181D] p-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#262A30] pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-[#D9F36A]" />
          <h3 className="font-display text-sm font-bold tracking-wider text-white">
            RACE CONTROL & TELEMETRY EVENT LOG
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono text-[#8E95A0]">
            LIVE STRATEGY FEED
          </span>
        </div>
      </div>

      {/* Events List */}
      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 font-mono text-xs">
        {events.map((evt) => (
          <div
            key={evt.id}
            className="flex items-start gap-2.5 rounded border border-[#262A30] bg-[#14171A] p-2 hover:border-[#383E48] transition-colors"
          >
            <div className="mt-0.5">{getIcon(evt.type)}</div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <span className="font-bold text-white text-[11px] truncate">
                  {evt.message}
                </span>
                <div className="flex items-center gap-1.5 text-[9px]">
                  <span className="rounded bg-[#22262C] px-1.5 py-0.5 text-[#8E95A0]">
                    LAP {evt.lap}
                  </span>
                  <span className="text-[#656E7B]">{evt.timestamp}</span>
                </div>
              </div>

              {evt.details && (
                <p className="text-[10px] text-[#8E95A0] mt-0.5 leading-relaxed">
                  {evt.details}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
