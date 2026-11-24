import type { RadioMeta } from "../lib/types";
import { Icon } from "./icons";

interface RadioDockProps {
  isPlaying: boolean;
  radioMeta: RadioMeta;
  volume: number;
  radioUrl: string;
  radioOpen: boolean;
  onToggleRadio: () => void;
  onSetVolume: (v: number) => void;
  onSetRadioUrl: (v: string) => void;
  onToggleRadioOpen: () => void;
}

export function RadioDock({
  isPlaying, radioMeta, volume, radioUrl, radioOpen,
  onToggleRadio, onSetVolume, onSetRadioUrl, onToggleRadioOpen,
}: RadioDockProps) {
  return (
    <aside className={`glass absolute z-10 left-1/2 bottom-7 -translate-x-1/2 rounded-[22px] transition-all duration-350 ease-[cubic-bezier(0.2,0.8,0.2,1)]
      w-[min(520px,calc(100vw-48px))] grid items-center gap-2 px-3 py-2.5
      max-md:bottom-3.5 max-md:w-[calc(100vw-28px)] max-md:rounded-[20px]
      ${radioOpen
        ? "h-[134px] items-start pt-2.5 grid-cols-[50px_1fr_minmax(112px,150px)_42px] max-md:h-[128px] max-md:grid-cols-[46px_1fr_80px_36px]"
        : "h-[70px] grid-cols-[50px_1fr_minmax(112px,150px)_42px] max-md:h-16 max-md:grid-cols-[46px_1fr_80px_36px]"
      }`}
    >
      {/* Play button */}
      <button
        className="w-12 h-12 rounded-full grid place-items-center bg-white/90 text-[#5a6a76] shadow-[0_6px_20px_rgba(10,14,26,0.12)] border-0 hover:scale-[1.04] hover:bg-white transition max-md:w-11 max-md:h-11"
        type="button"
        onClick={onToggleRadio}
        aria-label={isPlaying ? "Pause radio" : "Play radio"}
      >
        <Icon name={isPlaying ? "pause" : "play"} size={19} />
      </button>

      {/* Meta */}
      <button className="min-w-0 border-0 flex flex-col items-start bg-transparent px-2" type="button" onClick={onToggleRadioOpen}>
        <span className="max-w-full overflow-hidden text-white/92 text-[13px] font-[450] text-ellipsis whitespace-nowrap">
          {isPlaying ? radioMeta.title : "Ready to listen"}
        </span>
        <span className="mt-[3px] text-white/48 text-[10px] font-medium tracking-[0.08em] uppercase">
          {isPlaying ? radioMeta.station : "Box Radio · Lofi"}
        </span>
      </button>

      {/* Volume */}
      <div className="flex items-center gap-2 text-white/[0.68]">
        <Icon name="volume" size={18} />
        <input type="range" min="0" max="100" value={volume} onChange={(e) => onSetVolume(Number(e.target.value))}
          className="w-full h-[3px] accent-white/90 cursor-pointer" aria-label="Volume" />
      </div>

      {/* Settings toggle */}
      <button
        className="w-[42px] h-[42px] rounded-full grid place-items-center bg-transparent border-0 text-white/58 hover:text-white/85 transition"
        type="button"
        onClick={onToggleRadioOpen}
        aria-label="Radio settings"
      >
        <Icon name="settings" size={18} />
      </button>

      {/* URL form */}
      {radioOpen && (
        <form
          className="glass absolute left-3 right-3 bottom-3 h-12 rounded-[14px] grid items-center gap-2 px-2 py-[5px] grid-cols-[112px_1fr] max-md:grid-cols-[1fr]"
          onSubmit={(e) => { e.preventDefault(); onToggleRadioOpen(); }}
        >
          <label className="text-white/52 text-[10px] font-medium uppercase tracking-[0.08em] text-right max-md:hidden" htmlFor="radio-url">Stream URL</label>
          <input id="radio-url" type="url" value={radioUrl} onChange={(e) => onSetRadioUrl(e.target.value)}
            className="w-full h-9 border border-white/14 rounded-[10px] bg-white/[0.08] text-white px-2.5 text-[11px] outline-none" />
        </form>
      )}
    </aside>
  );
}
