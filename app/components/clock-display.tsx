import type { SkyPhase, WeatherInfo } from "../lib/types";
import { Icon } from "./icons";
import { LiquidGlass } from "./liquid-glass";

interface ClockDisplayProps {
  timeLabel: string;
  dateLabel: string;
  weather: WeatherInfo | null;
  now: Date;
  phase: SkyPhase;
  onStartTimer: () => void;
}

export function ClockDisplay({ timeLabel, dateLabel, weather, now, phase, onStartTimer }: ClockDisplayProps) {
  const appearance = phase === "night" ? "dark" : "light";
  return (
    <div className="flex flex-col items-center -mt-6 animate-rise-in">
      <time
        className="text-white/97 font-serif text-[clamp(80px,11vw,160px)] font-light leading-[0.85] -tracking-[0.04em] tabular-nums shadow-[0_8px_40px_rgba(10,14,26,0.1)]"
        dateTime={now.toISOString()}
        suppressHydrationWarning
      >
        {timeLabel}
      </time>

      <p className="mt-5 mb-2 text-white/65 text-xs font-normal uppercase tracking-[0.28em] max-md:text-[10px] max-md:tracking-[0.2em]" suppressHydrationWarning>
        {dateLabel}
      </p>

      {weather && (
        <div className="flex items-center gap-1.5 mb-5 text-white/50 text-[11px] tracking-[0.04em] max-md:text-[10px] max-md:flex-wrap max-md:justify-center" suppressHydrationWarning>
          <span>{weather.temperature}°C</span>
          <span className="text-white/25">·</span>
          <span>Humidity {weather.humidity}%</span>
          <span className="text-white/25">·</span>
          <span>Wind {weather.windSpeed} km/h</span>
        </div>
      )}

      <LiquidGlass asChild interactive material="clear" appearance={appearance} refraction={8} bezel={16} blur={2}>
        <button
          className="h-11 rounded-full flex items-center gap-2.5 px-5 text-white text-xs font-[450] tracking-[0.04em] opacity-[0.88] hover:opacity-100 transition"
          type="button"
          onClick={onStartTimer}
        >
          <Icon name="timer" size={18} />
          <span>Start focus</span>
        </button>
      </LiquidGlass>
    </div>
  );
}
