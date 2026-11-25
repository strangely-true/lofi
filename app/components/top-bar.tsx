import type { SkyPhase, MoonData } from "../lib/types";
import { Icon } from "./icons";
import { LiquidGlass } from "./liquid-glass";

interface TopBarProps {
  locationName: string;
  phase: SkyPhase;
  moonData: MoonData;
  isFullscreen: boolean;
  zenDimmed?: boolean;
  onRefreshLocation?: () => void;
  onToggleFullscreen: () => void;
  onToggleDrawer: () => void;
}

const PHASE_LABEL: Record<SkyPhase, string> = {
  night: "Night sky",
  twilight: "Pre-dawn",
  dawn: "Sunrise",
  morning: "Morning light",
  day: "Soft daylight",
  afternoon: "Afternoon",
  golden: "Golden hour",
  dusk: "Dusk",
};

export function TopBar({ locationName, phase, moonData, isFullscreen, zenDimmed = false, onRefreshLocation, onToggleFullscreen, onToggleDrawer }: TopBarProps) {
  const appearance = phase === "night" || phase === "twilight" || phase === "dusk" ? "dark" : "light";
  const statusText = phase === "night" ? `${moonData.name} ${moonData.emoji}` : PHASE_LABEL[phase];

  return (
    <header className={`absolute z-5 top-6 left-7 right-7 flex items-center justify-between transition-opacity duration-700 max-md:top-3.5 max-md:left-3.5 max-md:right-3.5 max-md:flex-wrap max-md:gap-2 ${zenDimmed ? "opacity-0 pointer-events-none" : "opacity-100"}`}>
      {/* Location */}
      <LiquidGlass asChild interactive material="clear" appearance={appearance} refraction={6} bezel={14} blur={2}>
        <button
          className="h-10 rounded-full flex items-center gap-2 px-4 text-white/90 text-xs font-[450] tracking-wide transition"
          type="button"
          onClick={onRefreshLocation}
          title="Refresh location & weather"
        >
          <Icon name="location" size={15} />
          <span>{locationName}</span>
        </button>
      </LiquidGlass>

      <div className="flex items-center gap-2.5 max-md:gap-1.5">
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

        {/* Controls drawer toggle */}
        <LiquidGlass asChild interactive material="clear" appearance={appearance} refraction={6} bezel={14} blur={2}>
          <button
            className="w-10 h-10 rounded-full grid place-items-center text-white/75 hover:text-white/95 transition max-md:w-9 max-md:h-9"
            type="button"
            onClick={onToggleDrawer}
            aria-label="Open controls"
          >
            <Icon name="sliders" size={16} />
          </button>
        </LiquidGlass>
      </div>
    </header>
  );
}
