import type { SkyPhase } from "../lib/types";
import { formatTimer } from "../lib/utils";
import { PRESETS } from "../lib/constants";
import { Icon } from "./icons";
import { LiquidGlass } from "./liquid-glass";

interface FocusTimerProps {
  duration: number;
  remaining: number;
  timerRunning: boolean;
  customOpen: boolean;
  customMinutes: string;
  phase: SkyPhase;
  onStartPreset: (minutes: number) => void;
  onToggleRunning: () => void;
  onClose: () => void;
  onSetCustomOpen: (v: boolean) => void;
  onSetCustomMinutes: (v: string) => void;
}

export function FocusTimer({
  duration, remaining, timerRunning, customOpen, customMinutes, phase,
  onStartPreset, onToggleRunning, onClose, onSetCustomOpen, onSetCustomMinutes,
}: FocusTimerProps) {
  const progress = duration ? ((duration - remaining) / duration) * 100 : 0;
  const appearance = phase === "night" ? "dark" : "light";

  return (
    <div className="relative flex flex-col items-center animate-rise-in" style={{ animationDuration: "0.7s" }}>
      {/* Ring */}
      <div
        className="w-[clamp(260px,28vw,390px)] aspect-square rounded-full grid place-items-center shadow-[0_25px_70px_rgba(10,14,26,0.18)] transition-[background] duration-500 linear max-md:w-[min(68vw,300px)]"
        style={{ background: `conic-gradient(rgba(255,255,255,0.88) ${progress * 3.6}deg, rgba(255,255,255,0.1) 0)` }}
      >
        {/* Inner fill (replaces ::before) */}
        <div className="absolute w-[calc(clamp(260px,28vw,390px)-8px)] aspect-square rounded-full bg-white/[0.06] blur-[2px] max-md:w-[calc(min(68vw,300px)-8px)]" />

        {/* Timer display */}
        <LiquidGlass
          material="clear"
          appearance={appearance}
          refraction={10}
          bezel={20}
          blur={3}
          className="relative z-[2] w-[calc(100%-18px)] h-[calc(100%-18px)] rounded-full flex flex-col items-center justify-center text-white"
        >
          <span className="mb-2.5 text-white/60 text-[10px] font-medium tracking-[0.32em]">FOCUS</span>
          <time className="font-serif text-[clamp(54px,7vw,90px)] leading-none -tracking-[0.04em] tabular-nums font-light" dateTime={`PT${remaining}S`}>
            {formatTimer(remaining)}
          </time>
        </LiquidGlass>
      </div>

      {/* Presets */}
      <div className="flex gap-2 mt-4 max-md:max-w-[calc(100vw-24px)] max-md:overflow-x-auto">
        {PRESETS.map((p) => (
          <LiquidGlass
            key={p.label}
            asChild
            interactive
            material={duration === p.minutes * 60 ? "regular" : "clear"}
            appearance={appearance}
            refraction={5}
            bezel={12}
            blur={2}
          >
            <button
              className={`h-9 rounded-full flex items-center gap-[7px] px-3.5 text-[10px] font-medium uppercase tracking-[0.08em] transition
                ${duration === p.minutes * 60 ? "text-white" : "text-white/[0.72] hover:text-white"}`}
              type="button"
              onClick={() => onStartPreset(p.minutes)}
            >
              {p.label}
              <span className="text-white/92 text-xs tracking-normal">{p.minutes}</span>
            </button>
          </LiquidGlass>
        ))}
        <LiquidGlass
          asChild
          interactive
          material={customOpen ? "regular" : "clear"}
          appearance={appearance}
          refraction={5}
          bezel={12}
          blur={2}
        >
          <button
            className="h-9 rounded-full flex items-center gap-[7px] px-3.5 text-white/[0.72] text-[10px] font-medium uppercase tracking-[0.08em] hover:text-white transition"
            type="button"
            onClick={() => onSetCustomOpen(!customOpen)}
          >
            Custom<span className="text-white/92 text-xs tracking-normal">+</span>
          </button>
        </LiquidGlass>
      </div>

      {/* Custom popover */}
      {customOpen && (
        <LiquidGlass asChild material="regular" appearance={appearance} refraction={12} bezel={18} blur={4}>
          <form
            className="absolute z-[8] top-full right-[-130px] w-[210px] mt-[58px] rounded-[18px] grid grid-cols-[1fr_70px] gap-2 p-3 text-white max-md:right-1/2 max-md:translate-x-1/2"
            onSubmit={(e) => { e.preventDefault(); const m = Number(customMinutes); if (m > 0) onStartPreset(Math.min(m, 180)); }}
          >
            <label className="col-span-full text-white/65 text-[10px] font-medium uppercase tracking-[0.12em]" htmlFor="custom-time">Minutes</label>
            <input id="custom-time" type="number" min="1" max="180" value={customMinutes} onChange={(e) => onSetCustomMinutes(e.target.value)}
              className="min-w-0 h-9 border border-white/14 rounded-[10px] bg-white/10 text-white px-2.5 text-xs outline-none" />
            <button type="submit" className="border-0 rounded-[10px] bg-white/82 text-[#3d4a56] font-medium text-xs">Set</button>
          </form>
        </LiquidGlass>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3 mt-3.5">
        <LiquidGlass asChild interactive material="clear" appearance={appearance} refraction={8} bezel={16} blur={2}>
          <button
            className="w-12 h-12 rounded-full grid place-items-center text-white transition"
            type="button"
            onClick={onToggleRunning}
          >
            <Icon name={timerRunning ? "pause" : "play"} size={22} />
          </button>
        </LiquidGlass>
        <button className="border-0 bg-transparent text-white/52 text-[11px] font-medium uppercase tracking-[0.12em]" type="button" onClick={onClose}>
          Exit
        </button>
      </div>
    </div>
  );
}
