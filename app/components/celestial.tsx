import type { SkyPhase, MoonData } from "../lib/types";

/** SVG path (in 0..100 viewBox) for the illuminated portion of the moon at `phase` in [0, 1). */
function moonLitPath(phase: number): string {
  const p = ((phase % 1) + 1) % 1;
  if (p < 0.01 || p > 0.99) return "";
  if (Math.abs(p - 0.5) < 0.01) {
    return "M 50 0 A 50 50 0 1 1 50 100 A 50 50 0 1 1 50 0 Z";
  }
  const cos = Math.cos(2 * Math.PI * p);
  const rx = Math.max(0.01, Math.abs(cos) * 50);
  if (p < 0.5) {
    // Waxing: right limb lit
    const termSweep = cos > 0 ? 0 : 1;
    return `M 50 0 A 50 50 0 0 1 50 100 A ${rx.toFixed(2)} 50 0 0 ${termSweep} 50 0 Z`;
  }
  // Waning: left limb lit
  const termSweep = cos < 0 ? 0 : 1;
  return `M 50 0 A 50 50 0 0 0 50 100 A ${rx.toFixed(2)} 50 0 0 ${termSweep} 50 0 Z`;
}

export function Celestial({ phase, sunProgress, moonData }: { phase: SkyPhase; sunProgress: number; moonData: MoonData }) {
  const isNight = phase === "night";
  const litPath = isNight ? moonLitPath(moonData.phase) : "";
  const illumination = (1 - Math.cos(2 * Math.PI * moonData.phase)) / 2;

  return (
    <div
      className={`absolute -z-10 transition-all duration-[2000ms] ease-in-out ${
        isNight ? "left-[76%] bottom-[65%] w-[62px] h-[62px]" : "bottom-[31%] w-[74px] h-[74px]"
      }`}
      style={!isNight ? { left: `${sunProgress}%`, transform: "translateX(-50%)" } : { transform: "translateX(-50%)" }}
      aria-hidden="true"
    >
      {isNight ? (
        <div
          className="relative w-full h-full rounded-full"
          style={{
            boxShadow: `0 0 ${20 + illumination * 22}px ${4 + illumination * 6}px rgba(210,220,240,${(0.05 + illumination * 0.14).toFixed(3)})`,
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full rounded-full overflow-hidden">
            <defs>
              <radialGradient id="moon-surface" cx="42%" cy="38%" r="60%">
                <stop offset="0%" stopColor="#f7f5e6" />
                <stop offset="65%" stopColor="#e8e4cd" />
                <stop offset="100%" stopColor="#d6d1b8" />
              </radialGradient>
              <clipPath id="moon-lit-clip">
                {litPath ? <path d={litPath} /> : <path d="M 0 0" />}
              </clipPath>
            </defs>

            {/* Unlit side (subtle earthshine) */}
            <circle cx="50" cy="50" r="50" fill="rgba(16, 24, 42, 0.72)" />

            {/* Illuminated portion + craters */}
            {litPath && (
              <g clipPath="url(#moon-lit-clip)">
                <circle cx="50" cy="50" r="50" fill="url(#moon-surface)" />
                <circle cx="30" cy="34" r="7.5" fill="rgba(0,0,0,0.06)" />
                <circle cx="58" cy="54" r="5.5" fill="rgba(0,0,0,0.06)" />
                <circle cx="52" cy="25" r="4" fill="rgba(0,0,0,0.05)" />
                <circle cx="38" cy="68" r="6" fill="rgba(0,0,0,0.05)" />
              </g>
            )}
          </svg>
        </div>
      ) : (
        <div className="w-full h-full rounded-full relative blur-[0.2px] transition-all duration-[1800ms] bg-[rgba(255,245,205,0.96)] shadow-[0_0_28px_12px_rgba(255,221,164,0.48),0_0_80px_32px_rgba(255,226,180,0.16)]" />
      )}
    </div>
  );
}
