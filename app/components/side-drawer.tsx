import type { SkyPhase } from "../lib/types";
import { DEFAULT_RADIO_URL } from "../lib/constants";
import { Icon } from "./icons";
import { LiquidGlass } from "./liquid-glass";

interface SideDrawerProps {
  open: boolean;
  volume: number;
  radioUrl: string;
  isFullscreen: boolean;
  phase: SkyPhase;
  onClose: () => void;
  onSetVolume: (v: number) => void;
  onSetRadioUrl: (v: string) => void;
  onToggleFullscreen: () => void;
}

export function SideDrawer({
  open,
  volume,
  radioUrl,
  isFullscreen,
  phase,
  onClose,
  onSetVolume,
  onSetRadioUrl,
  onToggleFullscreen,
}: SideDrawerProps) {
  const appearance = phase === "night" ? "dark" : "light";

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-20 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Responsive floating glass sheet: right-side card on desktop, bottom-anchored sheet on mobile */}
      <div
        className={`fixed z-30 transition-all duration-350 ease-[cubic-bezier(0.22,1,0.36,1)]
          top-20 right-7 w-[310px]
          max-md:top-auto max-md:inset-x-3.5 max-md:bottom-4 max-md:w-auto
          ${
            open
              ? "opacity-100 translate-y-0 translate-x-0 scale-100 pointer-events-auto"
              : "opacity-0 md:translate-x-6 max-md:translate-y-6 scale-95 pointer-events-none"
          }`}
        role="dialog"
        aria-modal="true"
        aria-label="Preferences"
      >
        <LiquidGlass
          material="regular"
          appearance={appearance}
          refraction={14}
          bezel={22}
          blur={4}
          className="rounded-[24px] text-white"
        >
          <div className="max-h-[72vh] max-md:max-h-[65vh] overflow-y-auto p-5 flex flex-col gap-5 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.18)_transparent]">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white/90">
                <Icon name="radio" size={16} />
                <span className="text-xs font-medium uppercase tracking-[0.16em]">Controls</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-7 h-7 rounded-full grid place-items-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close controls"
              >
                <Icon name="close" size={15} />
              </button>
            </div>

            {/* Radio section */}
            <Section title="Stream">
              <div className="flex items-center gap-1.5">
                <input
                  className="flex-1 min-w-0 h-9 border border-white/15 rounded-xl bg-white/[0.08] text-white px-3 text-xs outline-none focus:border-white/35 transition-colors"
                  type="url"
                  value={radioUrl}
                  onChange={(e) => onSetRadioUrl(e.target.value)}
                  placeholder="Stream URL"
                  aria-label="Radio stream URL"
                />
                {radioUrl !== DEFAULT_RADIO_URL && (
                  <button
                    type="button"
                    onClick={() => onSetRadioUrl(DEFAULT_RADIO_URL)}
                    className="shrink-0 w-9 h-9 rounded-xl border border-white/15 bg-white/[0.08] grid place-items-center text-white/70 hover:text-white hover:bg-white/15 transition-colors"
                    aria-label="Reset stream URL"
                    title="Reset to default stream"
                  >
                    <Icon name="reset" size={14} />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <Icon name={volume === 0 ? "volume-mute" : "volume"} size={15} className="text-white/60 shrink-0" />
                <input
                  className="flex-1 h-[3px] accent-white/90 cursor-pointer"
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => onSetVolume(Number(e.target.value))}
                  aria-label="Volume"
                />
                <span className="text-white/60 text-[11px] tabular-nums min-w-8 text-right">
                  {volume}%
                </span>
              </div>
            </Section>

            {/* Display section */}
            <Section title="Display">
              <button
                className="flex items-center justify-center gap-2 h-9 px-3.5 border border-white/15 rounded-xl bg-white/[0.08] text-white/85 text-xs font-[450] cursor-pointer hover:bg-white/15 hover:text-white transition-colors"
                type="button"
                onClick={onToggleFullscreen}
              >
                <Icon name={isFullscreen ? "exit-fullscreen" : "fullscreen"} size={14} />
                <span>{isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}</span>
              </button>
            </Section>

            {/* Credits */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
              <p className="m-0 text-white/90 font-serif text-base font-normal tracking-[0.01em]">
                Sabittwa
              </p>
              <a
                href="https://strangelytrue.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-white/55 text-[11px] font-[450] no-underline tracking-[0.02em] hover:text-white/90 transition-colors"
              >
                <span>strangelytrue</span>
                <Icon name="link" size={12} />
              </a>
            </div>
          </div>
        </LiquidGlass>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="m-0 text-white/50 text-[10px] font-semibold uppercase tracking-[0.18em]">
        {title}
      </h3>
      {children}
    </div>
  );
}
