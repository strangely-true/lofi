import type { SkyPhase } from "../lib/types";
import { formatTimer } from "../lib/utils";
import { PRESETS } from "../lib/constants";
import { Icon } from "./icons";
import { LiquidGlass } from "./liquid-glass";

interface FocusTimerProps {
  active: boolean;
  duration: number;
  remaining: number;
  timerRunning: boolean;
  focusPhase: "focus" | "break";
  sessionsCompleted: number;
  customOpen: boolean;
  customMinutes: string;
  phase: SkyPhase;
  onStartPreset: (minutes: number) => void;
  onToggleRunning: () => void;
  onClose: () => void;
  onSetCustomOpen: (v: boolean) => void;
  onSetCustomMinutes: (v: string) => void;
}

const RING_RADIUS = 47;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export function FocusTimer({
  active,
  duration,
  remaining,
  timerRunning,
  focusPhase,
  sessionsCompleted,
  customOpen,
  customMinutes,
  phase,
  onStartPreset,
  onToggleRunning,
  onClose,
  onSetCustomOpen,
  onSetCustomMinutes,
}: FocusTimerProps) {
  const progress = duration ? (duration - remaining) / duration : 0;
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress);
  const appearance = phase === "night" ? "dark" : "light";

  return (
    <div
      className={`col-start-1 row-start-1 relative flex flex-col items-center mt-14 max-md:mt-10 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        active
          ? "opacity-100 translate-y-0 scale-100 blur-0 pointer-events-auto"
          : "opacity-0 translate-y-14 scale-90 blur-sm pointer-events-none"
      }`}
      aria-hidden={!active}
    >
      {/* Ring */}
      <div className="relative w-[clamp(240px,25vw,350px)] aspect-square rounded-full grid place-items-center shadow-[0_25px_70px_rgba(10,14,26,0.18)] max-md:w-[min(64vw,270px)]">
        {/* Ambient breathing halo when running */}
        <div
          className={`absolute inset-0 rounded-full bg-white/10 blur-2xl transition-opacity duration-1000 pointer-events-none ${
            timerRunning ? "opacity-60 animate-pulse" : "opacity-0"
          }`}
        />

        {/* Smooth SVG progress ring */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none"
          aria-hidden="true"
        >
          <circle
            cx="50"
            cy="50"
            r={RING_RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="2.2"
          />
          <circle
            cx="50"
            cy="50"
            r={RING_RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeDasharray={RING_CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
            style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.45))" }}
          />
        </svg>

        {/* Timer display */}
        <LiquidGlass
          material="clear"
          appearance={appearance}
          refraction={10}
          bezel={20}
          blur={3}
          className="relative z-[2] w-[calc(100%-22px)] h-[calc(100%-22px)] rounded-full flex flex-col items-center justify-center text-white"
        >
          <span className="mb-2 text-white/60 text-[10px] font-medium tracking-[0.32em]">
            {!timerRunning ? "PAUSED" : focusPhase === "break" ? "BREAK" : "FOCUSING"}
          </span>
          <time
            className="font-serif text-[clamp(50px,6.5vw,84px)] leading-none -tracking-[0.04em] tabular-nums font-light"
            dateTime={`PT${remaining}S`}
          >
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
              tabIndex={active ? 0 : -1}
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
            tabIndex={active ? 0 : -1}
          >
            Custom<span className="text-white/92 text-xs tracking-normal">+</span>
          </button>
        </LiquidGlass>
      </div>

      {/* Custom popover */}
      {customOpen && active && (
        <LiquidGlass asChild material="regular" appearance={appearance} refraction={12} bezel={18} blur={4}>
          <form
            className="absolute z-[8] top-full right-[-130px] w-[210px] mt-3 rounded-[18px] grid grid-cols-[1fr_70px] gap-2 p-3 text-white max-md:right-1/2 max-md:translate-x-1/2 animate-rise-in"
            style={{ animationDuration: "0.25s" }}
            onSubmit={(e) => {
              e.preventDefault();
              const m = Number(customMinutes);
              if (m > 0) onStartPreset(Math.min(m, 180));
            }}
          >
            <label className="col-span-full text-white/65 text-[10px] font-medium uppercase tracking-[0.12em]" htmlFor="custom-time">
              Minutes
            </label>
            <input
              id="custom-time"
              type="number"
              min="1"
              max="180"
              value={customMinutes}
              onChange={(e) => onSetCustomMinutes(e.target.value)}
              className="min-w-0 h-9 border border-white/14 rounded-[10px] bg-white/10 text-white px-2.5 text-xs outline-none"
            />
            <button type="submit" className="border-0 rounded-[10px] bg-white/82 text-[#3d4a56] font-medium text-xs">
              Set
            </button>
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
            tabIndex={active ? 0 : -1}
            aria-label={timerRunning ? "Pause timer" : "Start timer"}
          >
            <Icon name={timerRunning ? "pause" : "play"} size={20} />
          </button>
        </LiquidGlass>
        <button
          className="border-0 bg-transparent text-white/55 hover:text-white/90 text-[11px] font-medium uppercase tracking-[0.12em] transition-colors"
          type="button"
          onClick={onClose}
          tabIndex={active ? 0 : -1}
        >
          Exit
        </button>
      </div>

      {/* Session dots */}
      {sessionsCompleted > 0 && (
        <div
          className="flex items-center gap-1.5 mt-3"
          aria-label={`${sessionsCompleted} focus session${sessionsCompleted === 1 ? "" : "s"} completed`}
        >
          {Array.from({ length: Math.min(sessionsCompleted, 8) }).map((_, i) => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-white/75 shadow-[0_0_6px_rgba(255,255,255,0.5)]" />
          ))}
          {sessionsCompleted > 8 && (
            <span className="text-[10px] text-white/60 ml-0.5">+{sessionsCompleted - 8}</span>
          )}
        </div>
      )}
    </div>
  );
}
