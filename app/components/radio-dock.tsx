import type { RadioMeta, SkyPhase } from "../lib/types";
import { Icon } from "./icons";
import { LiquidGlass } from "./liquid-glass";

interface RadioDockProps {
  isPlaying: boolean;
  audioStatus: "idle" | "loading" | "playing" | "error";
  radioMeta: RadioMeta;
  volume: number;
  phase: SkyPhase;
  zenDimmed?: boolean;
  onToggleRadio: () => void;
  onSetVolume: (v: number) => void;
}

export function RadioDock({
  isPlaying,
  audioStatus,
  radioMeta,
  volume,
  phase,
  zenDimmed = false,
  onToggleRadio,
  onSetVolume,
}: RadioDockProps) {
  const appearance = phase === "night" ? "dark" : "light";
  const volumeIcon =
    volume === 0 ? "volume-mute" : volume < 45 ? "volume-low" : "volume";

  return (
    <LiquidGlass
      asChild
      material="clear"
      appearance={appearance}
      refraction={10}
      bezel={18}
      blur={3}
    >
      <aside
        className={`absolute z-10 left-1/2 bottom-7 -translate-x-1/2 rounded-full text-white
          w-[min(460px,calc(100vw-32px))] h-[66px] flex items-center gap-3 px-2.5
          max-md:bottom-4 max-md:h-[60px] max-md:gap-2.5 max-md:px-2 animate-rise-in
          transition-opacity duration-700 ${zenDimmed ? "opacity-15 hover:opacity-100" : "opacity-100"}`}
      >
        {/* Play / Pause / Buffering */}
        <button
          className={`relative shrink-0 w-11 h-11 rounded-full grid place-items-center bg-white/92 text-[#2b3540] shadow-[0_6px_20px_rgba(10,14,26,0.18)] border-0 transition-transform duration-200 hover:scale-105 active:scale-95 max-md:w-10 max-md:h-10 ${
            isPlaying ? "ring-4 ring-white/20" : ""
          }`}
          type="button"
          onClick={onToggleRadio}
          aria-label={isPlaying ? "Pause radio" : "Play radio"}
        >
          {audioStatus === "loading" ? (
            <Icon name="loader" size={18} className="animate-spin" />
          ) : (
            <Icon name={isPlaying ? "pause" : "play"} size={18} />
          )}
        </button>

        {/* Station / Track Info */}
        <div className="min-w-0 flex-1 flex flex-col justify-center pr-1">
          <div className="flex items-center gap-2 min-w-0">
            {isPlaying && audioStatus !== "loading" && (
              <span className="shrink-0 flex items-end gap-[2px] h-3" aria-hidden="true">
                <span className="w-[2.5px] h-full rounded-full bg-white/90 origin-bottom animate-eq-bar" />
                <span
                  className="w-[2.5px] h-full rounded-full bg-white/90 origin-bottom animate-eq-bar"
                  style={{ animationDelay: "0.25s", animationDuration: "0.7s" }}
                />
                <span
                  className="w-[2.5px] h-full rounded-full bg-white/90 origin-bottom animate-eq-bar"
                  style={{ animationDelay: "0.45s", animationDuration: "1.1s" }}
                />
              </span>
            )}
            <span className="truncate text-white/95 text-[13px] font-medium tracking-[0.01em]">
              {audioStatus === "error"
                ? "Stream unavailable"
                : audioStatus === "loading"
                  ? "Connecting…"
                  : isPlaying
                    ? radioMeta.title
                    : "Ready to listen"}
            </span>
          </div>
          <span className="mt-0.5 truncate text-white/55 text-[10px] font-medium tracking-[0.1em] uppercase">
            {audioStatus === "error"
              ? "Tap play to retry"
              : isPlaying
                ? radioMeta.station
                : "Lofi · Ambient"}
          </span>
        </div>

        {/* Volume */}
        <div className="shrink-0 flex items-center gap-2 pr-2.5 max-md:pr-1.5">
          <button
            type="button"
            onClick={() => onSetVolume(volume === 0 ? 55 : 0)}
            className="w-7 h-7 rounded-full grid place-items-center text-white/70 hover:text-white transition-colors"
            aria-label={volume === 0 ? "Unmute" : "Mute"}
          >
            <Icon name={volumeIcon} size={16} />
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => onSetVolume(Number(e.target.value))}
            className="w-20 max-md:w-14 h-[3px] accent-white/90 cursor-pointer"
            aria-label="Volume"
          />
        </div>
      </aside>
    </LiquidGlass>
  );
}
