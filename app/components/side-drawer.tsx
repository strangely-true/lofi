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
  skyOverride: "auto" | SkyPhase;
  use12h: boolean;
  zenAutoHide: boolean;
  rainLevel: number;
  windLevel: number;
  fireLevel: number;
  onClose: () => void;
  onSetVolume: (v: number) => void;
  onSetRadioUrl: (v: string) => void;
  onToggleFullscreen: () => void;
  onSetSkyOverride: (v: "auto" | SkyPhase) => void;
  onSetUse12h: (v: boolean) => void;
  onSetZenAutoHide: (v: boolean) => void;
  onSetRainLevel: (v: number) => void;
  onSetWindLevel: (v: number) => void;
  onSetFireLevel: (v: number) => void;
}

const SKY_OPTIONS: Array<{ value: "auto" | SkyPhase; label: string }> = [
  { value: "auto", label: "Auto" },
  { value: "dawn", label: "Dawn" },
  { value: "day", label: "Day" },
  { value: "golden", label: "Golden" },
  { value: "night", label: "Night" },
];

export function SideDrawer({
  open,
  volume,
  radioUrl,
  isFullscreen,
  phase,
  skyOverride,
  use12h,
  zenAutoHide,
  rainLevel,
  windLevel,
  fireLevel,
  onClose,
  onSetVolume,
  onSetRadioUrl,
  onToggleFullscreen,
  onSetSkyOverride,
  onSetUse12h,
  onSetZenAutoHide,
  onSetRainLevel,
  onSetWindLevel,
  onSetFireLevel,
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
          top-20 right-7 w-[320px]
          max-md:top-auto max-md:inset-x-3.5 max-md:bottom-4 max-md:w-auto
          ${
            open
              ? "opacity-100 translate-y-0 translate-x-0 scale-100 pointer-events-auto"
              : "opacity-0 md:translate-x-6 max-md:translate-y-6 scale-95 pointer-events-none"
          }`}
        role="dialog"
        aria-modal="true"
        aria-label="Controls"
      >
        <LiquidGlass
          material="regular"
          appearance={appearance}
          refraction={14}
          bezel={22}
          blur={4}
          className="rounded-[24px] text-white"
        >
          <div className="max-h-[76vh] max-md:max-h-[70vh] overflow-y-auto p-5 flex flex-col gap-5 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.18)_transparent]">
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

            {/* Stream */}
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

            {/* Ambient Mixer */}
            <Section title="Ambient Mixer">
              <MixerRow icon="rain" label="Rain" value={rainLevel} onChange={onSetRainLevel} />
              <MixerRow icon="wind" label="Wind" value={windLevel} onChange={onSetWindLevel} />
              <MixerRow icon="fire" label="Warmth" value={fireLevel} onChange={onSetFireLevel} />
            </Section>

            {/* Sky Phase */}
            <Section title="Atmosphere">
              <div className="grid grid-cols-5 gap-1">
                {SKY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onSetSkyOverride(opt.value)}
                    className={`h-8 rounded-lg text-[10.5px] font-medium transition-colors border ${
                      skyOverride === opt.value
                        ? "bg-white/22 border-white/30 text-white"
                        : "bg-white/[0.05] border-white/10 text-white/60 hover:text-white hover:bg-white/12"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </Section>

            {/* Display & Clock */}
            <Section title="Display">
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="flex items-center justify-center gap-1.5 h-9 px-3 border border-white/15 rounded-xl bg-white/[0.08] text-white/85 text-xs font-[450] cursor-pointer hover:bg-white/15 hover:text-white transition-colors"
                  type="button"
                  onClick={() => onSetUse12h(!use12h)}
                >
                  <span>{use12h ? "12-Hour" : "24-Hour"}</span>
                </button>
                <button
                  className="flex items-center justify-center gap-1.5 h-9 px-3 border border-white/15 rounded-xl bg-white/[0.08] text-white/85 text-xs font-[450] cursor-pointer hover:bg-white/15 hover:text-white transition-colors"
                  type="button"
                  onClick={onToggleFullscreen}
                >
                  <Icon name={isFullscreen ? "exit-fullscreen" : "fullscreen"} size={13} />
                  <span>{isFullscreen ? "Exit Full" : "Fullscreen"}</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => onSetZenAutoHide(!zenAutoHide)}
                className="flex items-center justify-between h-9 px-3 border border-white/12 rounded-xl bg-white/[0.06] text-xs text-white/80 hover:bg-white/12 transition-colors"
              >
                <span>Zen auto-hide UI</span>
                <span className={`text-[10px] uppercase tracking-wider font-semibold ${zenAutoHide ? "text-white" : "text-white/40"}`}>
                  {zenAutoHide ? "On" : "Off"}
                </span>
              </button>
            </Section>

            {/* Shortcuts hint */}
            <p className="m-0 text-[10px] text-white/40 leading-relaxed max-md:hidden">
              Shortcuts: <span className="text-white/65">Space</span> play/pause · <span className="text-white/65">M</span> mute · <span className="text-white/65">F</span> fullscreen · <span className="text-white/65">D</span> controls
            </p>

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
    <div className="flex flex-col gap-2">
      <h3 className="m-0 text-white/50 text-[10px] font-semibold uppercase tracking-[0.18em]">
        {title}
      </h3>
      {children}
    </div>
  );
}

function MixerRow({
  icon,
  label,
  value,
  onChange,
}: {
  icon: "rain" | "wind" | "fire";
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon name={icon} size={14} className="text-white/60 shrink-0" />
      <span className="text-[11px] text-white/75 w-12 shrink-0">{label}</span>
      <input
        className="flex-1 h-[3px] accent-white/90 cursor-pointer"
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={`${label} ambient level`}
      />
      <span className="text-white/50 text-[10px] tabular-nums min-w-7 text-right">
        {value}%
      </span>
    </div>
  );
}
