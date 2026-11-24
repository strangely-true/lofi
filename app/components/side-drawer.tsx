import { Icon } from "./icons";

interface SideDrawerProps {
  open: boolean;
  volume: number;
  radioUrl: string;
  isFullscreen: boolean;
  onToggle: () => void;
  onSetVolume: (v: number) => void;
  onSetRadioUrl: (v: string) => void;
  onToggleFullscreen: () => void;
}

export function SideDrawer({
  open, volume, radioUrl, isFullscreen,
  onToggle, onSetVolume, onSetRadioUrl, onToggleFullscreen,
}: SideDrawerProps) {
  return (
    <div className="fixed z-15 right-0 top-1/2 -translate-y-1/2 flex items-center pointer-events-none max-md:top-auto max-md:bottom-[90px] max-md:translate-y-0">
      {/* Tab: >| */}
      <button
        className="pointer-events-auto w-7 h-14 border border-white/12 border-r-0 rounded-l-[10px] grid place-items-center bg-white/[0.07] text-white/50 backdrop-blur-[18px] backdrop-saturate-[130%] cursor-pointer hover:text-white/85 hover:bg-white/12 hover:w-8 transition-all duration-300 max-md:w-6 max-md:h-12"
        type="button"
        onClick={onToggle}
        aria-label={open ? "Close panel" : "Open panel"}
      >
        <Icon name={open ? "panel-close" : "panel-open"} size={16} />
      </button>

      {/* Panel */}
      <div className={`glass-heavy pointer-events-auto w-[260px] max-h-[70vh] overflow-y-auto rounded-l-[18px] border-r-0 p-5 flex flex-col gap-4 transition-all duration-350 ease-[cubic-bezier(0.2,0.8,0.2,1)]
        max-md:w-[230px] max-md:max-h-[50vh] max-md:p-4
        ${open ? "translate-x-0 opacity-100" : "translate-x-full opacity-0 pointer-events-none"}
        [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent]`}
      >
        {/* Radio section */}
        <Section title="Radio">
          <Row label="Stream">
            <input
              className="flex-1 min-w-0 h-8 border border-white/10 rounded-lg bg-white/[0.06] text-white px-2 text-[11px] outline-none focus:border-white/25 transition-colors"
              type="url"
              value={radioUrl}
              onChange={(e) => onSetRadioUrl(e.target.value)}
              placeholder="Stream URL"
            />
          </Row>
          <Row label="Volume">
            <input className="flex-1 h-[3px] accent-white/85 cursor-pointer" type="range" min="0" max="100" value={volume} onChange={(e) => onSetVolume(Number(e.target.value))} />
            <span className="text-white/50 text-[10px] tabular-nums min-w-7 text-right">{volume}%</span>
          </Row>
        </Section>

        {/* Display section */}
        <Section title="Display">
          <button
            className="flex items-center gap-2 h-[34px] px-3 border border-white/10 rounded-[10px] bg-white/[0.06] text-white/75 text-[11px] font-[450] cursor-pointer hover:bg-white/12 hover:text-white transition"
            type="button"
            onClick={onToggleFullscreen}
          >
            <Icon name={isFullscreen ? "exit-fullscreen" : "fullscreen"} size={14} />
            <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
          </button>
        </Section>

        {/* Credits */}
        <div className="mt-auto flex flex-col gap-2.5">
          <div className="h-px bg-white/[0.08] mb-1" />
          <p className="m-0 text-white/88 font-serif text-base font-normal tracking-[0.01em]">Sabittwa</p>
          <a
            href="https://strangelytrue.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-[5px] text-white/45 text-[10.5px] font-[450] no-underline tracking-[0.02em] hover:text-white/80 transition-colors"
          >
            <Icon name="link" size={12} />
            <span>strangelytrue.vercel.app</span>
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── tiny sub-components ── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="m-0 text-white/50 text-[9px] font-semibold uppercase tracking-[0.18em]">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="shrink-0 text-white/60 text-[11px] font-[450] min-w-12">{label}</span>
      {children}
    </div>
  );
}
