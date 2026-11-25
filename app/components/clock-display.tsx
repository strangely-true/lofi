import type { SkyPhase, WeatherInfo } from "../lib/types";
import { Icon } from "./icons";
import { LiquidGlass } from "./liquid-glass";

interface ClockDisplayProps {
  timeLabel: string;
  dateLabel: string;
  weather: WeatherInfo | null;
  now: Date;
  phase: SkyPhase;
  minimized: boolean;
  zenDimmed?: boolean;
  onStartTimer: () => void;
}

export function ClockDisplay({
  timeLabel,
  dateLabel,
  weather,
  now,
  phase,
  minimized,
  zenDimmed = false,
  onStartTimer,
}: ClockDisplayProps) {
  const appearance = phase === "night" || phase === "twilight" || phase === "dusk" ? "dark" : "light";

  const [mainTime, period] = timeLabel.split(" ");

  return (
    <div
      className={`col-start-1 row-start-1 flex flex-col items-center transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        minimized
          ? "-translate-y-[clamp(175px,27vh,245px)] scale-[0.42] opacity-80 pointer-events-none max-md:-translate-y-[clamp(160px,26vh,210px)] max-md:scale-[0.46]"
          : "-mt-6 translate-y-0 scale-100 opacity-100 animate-rise-in"
      }`}
    >
      <time
        className="flex items-baseline gap-2.5 text-white/95 font-sans text-[clamp(74px,10.5vw,148px)] font-light leading-[0.9] -tracking-[0.04em] tabular-nums drop-shadow-[0_6px_28px_rgba(10,14,26,0.14)]"
        dateTime={now.toISOString()}
        suppressHydrationWarning
      >
        <span>{mainTime}</span>
        {period && (
          <span className="text-[0.22em] font-medium tracking-[0.14em] text-white/65 uppercase">
            {period}
          </span>
        )}
      </time>

      <div
        className={`flex flex-col items-center transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          minimized || zenDimmed ? "opacity-0 -translate-y-3 scale-95 pointer-events-none" : "opacity-100 translate-y-0 scale-100"
        }`}
      >
        <p
          className="mt-5 mb-2 text-white/65 text-xs font-normal uppercase tracking-[0.28em] max-md:text-[10px] max-md:tracking-[0.2em]"
          suppressHydrationWarning
        >
          {dateLabel}
        </p>

        {weather && (
          <div
            className="flex items-center gap-1.5 mb-5 text-white/50 text-[11px] tracking-[0.04em] max-md:text-[10px] max-md:flex-wrap max-md:justify-center"
            suppressHydrationWarning
          >
            <span>{weather.temperature}°C</span>
            <span className="text-white/25">·</span>
            <span>Humidity {weather.humidity}%</span>
            <span className="text-white/25">·</span>
            <span>Wind {weather.windSpeed} km/h</span>
            {weather.aqi != null && (
              <>
                <span className="text-white/25">·</span>
                <span>AQI {weather.aqi}</span>
              </>
            )}
          </div>
        )}

        <LiquidGlass asChild interactive material="clear" appearance={appearance} refraction={8} bezel={16} blur={2}>
          <button
            className="h-11 rounded-full flex items-center gap-2.5 px-5 text-white text-xs font-[450] tracking-[0.04em] opacity-[0.88] hover:opacity-100 transition"
            type="button"
            onClick={onStartTimer}
            tabIndex={minimized ? -1 : 0}
          >
            <Icon name="timer" size={18} />
            <span>Start focus</span>
          </button>
        </LiquidGlass>
      </div>
    </div>
  );
}
