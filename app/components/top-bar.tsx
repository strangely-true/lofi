import type { SkyPhase, MoonData, WeatherInfo } from "../lib/types";
import { Icon } from "./icons";
import { LiquidGlass } from "./liquid-glass";

interface TopBarProps {
  locationName: string;
  weather: WeatherInfo | null;
  phase: SkyPhase;
  moonData: MoonData;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export function TopBar({ locationName, weather, phase, moonData, isFullscreen, onToggleFullscreen }: TopBarProps) {
  const appearance = phase === "night" ? "dark" : "light";
  const statusText = phase === "night"
    ? `${moonData.name} ${moonData.emoji}`
    : phase === "dawn" ? "Morning light"
    : phase === "golden" ? "Golden hour"
    : "Soft daylight";

  return (
    <header className="absolute z-5 top-6 left-7 right-7 flex items-center justify-between max-md:top-3.5 max-md:left-3.5 max-md:right-3.5 max-md:flex-wrap max-md:gap-2">
      {/* Location */}
      <LiquidGlass asChild interactive material="clear" appearance={appearance} refraction={6} bezel={14} blur={2}>
        <button className="h-10 rounded-full flex items-center gap-2 px-4 text-white/90 text-xs font-[450] tracking-wide transition" type="button">
          <Icon name="location" size={15} />
          <span>{locationName}</span>
        </button>
      </LiquidGlass>

      <div className="flex items-center gap-2.5 max-md:gap-1.5">
        {/* Weather pill */}
        {weather && (
          <LiquidGlass asChild material="clear" appearance={appearance} refraction={6} bezel={14} blur={2}>
            <div className="h-10 rounded-full flex items-center gap-1.5 px-3.5 text-xs font-[450] text-white max-md:hidden">
              <span className="text-white/95 font-medium">{weather.temperature}°C</span>
              <span className="text-white/35">·</span>
              <span className="text-white/70">{weather.description}</span>
            </div>
          </LiquidGlass>
        )}

        {/* Sky status */}
        <div className="h-10 rounded-full flex items-center gap-2 px-3.5 text-white/[0.68] text-[11px] uppercase tracking-[0.12em] max-md:hidden">
          <span className="w-[7px] h-[7px] rounded-full bg-white/85 shadow-[0_0_10px_rgba(255,255,255,0.7)] animate-pulse-dot" />
          <span>{statusText}</span>
        </div>

        {/* Fullscreen */}
        <LiquidGlass asChild interactive material="clear" appearance={appearance} refraction={6} bezel={14} blur={2}>
          <button
            className="w-10 h-10 rounded-full grid place-items-center text-white/75 hover:text-white/95 transition max-md:w-9 max-md:h-9"
            type="button"
            onClick={onToggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            <Icon name={isFullscreen ? "exit-fullscreen" : "fullscreen"} size={16} />
          </button>
        </LiquidGlass>
      </div>
    </header>
  );
}
