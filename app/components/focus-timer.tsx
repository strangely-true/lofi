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
  focusPhase: "focus" | "break" | "longBreak";
  sessionsCompleted: number;
  customOpen: boolean;
  customMinutes: string;
  phase: SkyPhase;
  zenDimmed?: boolean;
  onStartPreset: (minutes: number, kind?: "focus" | "break" | "longBreak") => void;
  onToggleRunning: () => void;
  onSkipPhase: () => void;
  onClose: () => void;
  onSetCustomOpen: (v: boolean) => void;
  onSetCustomMinutes: (v: string) => void;
}

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
  zenDimmed = false,
  onStartPreset,
  onToggleRunning,
  onSkipPhase,
  onClose,
  onSetCustomOpen,
  onSetCustomMinutes,
}: FocusTimerProps) {
  const progress = duration ? Math.max(0, Math.min(100, ((duration - remaining) / duration) * 100)) : 0;
  const appearance = phase === "night" || phase === "twilight" || phase === "dusk" ? "dark" : "light";

  const phaseLabel = !timerRunning
    ? "PAUSED"
    : focusPhase === "longBreak"
      ? "LONG BREAK"
      : focusPhase === "break"
        ? "SHORT BREAK"
        : "POMODORO";

  const cyclePos = sessionsCompleted % 4;

  return (
    <div
      className={`col-start-1 row-start-1 relative flex flex-col items-center mt-10 max-md:mt-8 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        active
          ? "opacity-100 translate-y-0 scale-100 blur-0 pointer-events-auto"
          : "opacity-0 translate-y-14 scale-95 blur-sm pointer-events-none"
      }`}
      aria-hidden={!active}
    >
      {/* Phase label */}
      <span className="mb-2 text-white/60 text-[10px] font-medium uppercase tracking-[0.32em]">
        {phaseLabel}
      </span>

      {/* Minimalist sans countdown */}
      <time
        className="text-white/95 font-sans text-[clamp(70px,10vw,136px)] font-light leading-[0.9] -tracking-[0.04em] tabular-nums drop-shadow-[0_6px_28px_rgba(10,14,26,0.14)]"
        dateTime={`PT${remaining}S`}
      >
        {formatTimer(remaining)}
      </time>

      {/* Razor-thin progress bar */}
      <div className="mt-5 w-52 max-md:w-44 h-[2px] rounded-full bg-white/15 overflow-hidden">
        <div
          className="h-full rounded-full bg-white/85 transition-[width] duration-1000 ease-linear shadow-[0_0_8px_rgba(255,255,255,0.6)]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Pomodoro 4-session cycle dots */}
      <div
        className={`flex items-center gap-2 mt-4 transition-opacity duration-700 ${
          zenDimmed ? "opacity-0" : "opacity-100"
        }`}
        aria-label={`${sessionsCompleted} pomodoro session${sessionsCompleted === 1 ? "" : "s"} completed`}
      >
        {[0, 1, 2, 3].map((idx) => (
          <span
            key={idx}
            className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
              idx < cyclePos || (cyclePos === 0 && sessionsCompleted > 0 && focusPhase !== "focus")
                ? "bg-white/90 shadow-[0_0_6px_rgba(255,255,255,0.65)] scale-110"
                : "bg-white/25"
            }`}
          />
        ))}
      </div>

      {/* Controls & Presets (hidden in Zen idle mode) */}
      <div
        className={`flex flex-col items-center transition-opacity duration-700 ${
          zenDimmed ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        {/* Presets */}
        <div className="flex items-center gap-2 mt-5 max-md:max-w-[calc(100vw-24px)] max-md:overflow-x-auto">
          {PRESETS.map((p) => (
            <LiquidGlass
              key={p.label}
              asChild
              interactive
              material={duration === p.minutes * 60 && focusPhase === p.kind ? "regular" : "clear"}
              appearance={appearance}
              refraction={5}
              bezel={12}
              blur={2}
            >
              <button
                className={`h-8 rounded-full flex items-center gap-1.5 px-3 text-[10px] font-medium uppercase tracking-[0.08em] transition ${
                  duration === p.minutes * 60 && focusPhase === p.kind
                    ? "text-white"
                    : "text-white/[0.68] hover:text-white"
                }`}
                type="button"
                onClick={() => onStartPreset(p.minutes, p.kind)}
                tabIndex={active ? 0 : -1}
              >
                {p.label}
                <span className="text-white/90 text-[11px] tracking-normal">{p.minutes}</span>
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
              className="h-8 rounded-full flex items-center gap-1 px-3 text-white/[0.68] text-[10px] font-medium uppercase tracking-[0.08em] hover:text-white transition"
              type="button"
              onClick={() => onSetCustomOpen(!customOpen)}
              tabIndex={active ? 0 : -1}
            >
              Custom<span className="text-white/90 text-[11px] tracking-normal">+</span>
            </button>
          </LiquidGlass>
        </div>

        {/* Custom popover */}
        {customOpen && active && (
          <LiquidGlass asChild material="regular" appearance={appearance} refraction={12} bezel={18} blur={4}>
            <form
              className="absolute z-[8] top-full right-[-110px] w-[210px] mt-3 rounded-[18px] grid grid-cols-[1fr_70px] gap-2 p-3 text-white max-md:right-1/2 max-md:translate-x-1/2 animate-rise-in"
              style={{ animationDuration: "0.25s" }}
              onSubmit={(e) => {
                e.preventDefault();
                const m = Number(customMinutes);
                if (m > 0) onStartPreset(Math.min(m, 180), "focus");
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
              <button type="submit" className="border-0 rounded-[10px] bg-white/85 text-[#2b3540] font-medium text-xs">
                Set
              </button>
            </form>
          </LiquidGlass>
        )}

        {/* Action row */}
        <div className="flex items-center gap-4 mt-4">
          <LiquidGlass asChild interactive material="clear" appearance={appearance} refraction={8} bezel={16} blur={2}>
            <button
              className="w-11 h-11 rounded-full grid place-items-center text-white transition"
              type="button"
              onClick={onToggleRunning}
              tabIndex={active ? 0 : -1}
              aria-label={timerRunning ? "Pause timer" : "Start timer"}
            >
              <Icon name={timerRunning ? "pause" : "play"} size={18} />
            </button>
          </LiquidGlass>
          <button
            className="w-8 h-8 rounded-full grid place-items-center text-white/50 hover:text-white/90 transition-colors"
            type="button"
            onClick={onSkipPhase}
            tabIndex={active ? 0 : -1}
            aria-label="Skip to next phase"
            title="Skip phase"
          >
            <Icon name="skip" size={15} />
          </button>
          <button
            className="border-0 bg-transparent text-white/50 hover:text-white/90 text-[10.5px] font-medium uppercase tracking-[0.14em] transition-colors"
            type="button"
            onClick={onClose}
            tabIndex={active ? 0 : -1}
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}
