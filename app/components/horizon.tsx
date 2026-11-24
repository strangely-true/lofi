import type { SkyPhase } from "../lib/types";

export function Horizon({ phase }: { phase: SkyPhase }) {
  const isDark = phase === "night" || phase === "twilight" || phase === "dusk";
  const isGolden = phase === "dawn" || phase === "golden";

  const backFill = isDark
    ? "rgba(8, 13, 26, 0.42)"
    : isGolden
      ? "rgba(48, 32, 42, 0.22)"
      : "rgba(32, 48, 62, 0.16)";

  const frontFill = isDark
    ? "rgba(5, 9, 18, 0.68)"
    : isGolden
      ? "rgba(34, 22, 32, 0.34)"
      : "rgba(22, 34, 46, 0.24)";

  return (
    <div
      className="absolute inset-x-0 bottom-0 h-[18vh] min-h-[100px] max-h-[190px] -z-[4] pointer-events-none select-none overflow-hidden"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
        className="w-full h-full block transition-all duration-[2000ms]"
      >
        {/* Distant soft ridge */}
        <path
          d="M0,125 C240,85 460,145 740,108 C1020,72 1240,130 1440,96 L1440,200 L0,200 Z"
          fill={backFill}
          className="transition-[fill] duration-[2000ms]"
        />
        {/* Foreground gentle hill */}
        <path
          d="M0,152 C320,124 580,174 920,138 C1160,114 1320,148 1440,136 L1440,200 L0,200 Z"
          fill={frontFill}
          className="transition-[fill] duration-[2000ms]"
        />
      </svg>
    </div>
  );
}
