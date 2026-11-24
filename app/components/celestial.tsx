import type { CelestialBodyPos, MoonData, SkyPhase } from "../lib/types";

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
    const termSweep = cos > 0 ? 0 : 1;
    return `M 50 0 A 50 50 0 0 1 50 100 A ${rx.toFixed(2)} 50 0 0 ${termSweep} 50 0 Z`;
  }
  const termSweep = cos < 0 ? 0 : 1;
  return `M 50 0 A 50 50 0 0 0 50 100 A ${rx.toFixed(2)} 50 0 0 ${termSweep} 50 0 Z`;
}

export function Celestial({
  phase,
  sun,
  moon,
  moonData,
  animatePosition = true,
}: {
  phase: SkyPhase;
  sun: CelestialBodyPos;
  moon: CelestialBodyPos;
  moonData: MoonData;
  animatePosition?: boolean;
}) {
  const litPath = moonLitPath(moonData.phase);
  const illumination = moonData.fraction ?? (1 - Math.cos(2 * Math.PI * moonData.phase)) / 2;
  const isDarkSky = phase === "night" || phase === "twilight" || phase === "dusk";
  const isGolden = phase === "dawn" || phase === "golden";

  // Daytime moon is subtly translucent against bright sky; night moon is crisp
  const moonOpacity = !moon.visible ? 0 : isDarkSky ? 1 : 0.35;
  const sunOpacity = !sun.visible ? 0 : sun.altitudeDeg < 2 ? 0.85 : 1;
  const posTransition = animatePosition ? "transition-all duration-[2000ms] ease-in-out" : "transition-opacity duration-700";

  return (
    <>
      {/* Sun */}
      <div
        className={`absolute -z-10 w-[72px] h-[72px] -translate-x-1/2 -translate-y-1/2 pointer-events-none ${posTransition}`}
        style={{ left: `${sun.x}%`, top: `${sun.y}%`, opacity: sunOpacity }}
        aria-hidden="true"
      >
        <div
          className={`w-full h-full rounded-full blur-[0.2px] transition-all duration-[1800ms] ${
            isGolden
              ? "bg-[rgba(255,220,165,0.96)] shadow-[0_0_34px_14px_rgba(255,180,110,0.52),0_0_90px_36px_rgba(255,170,100,0.22)]"
              : "bg-[rgba(255,246,210,0.96)] shadow-[0_0_28px_12px_rgba(255,225,170,0.48),0_0_80px_32px_rgba(255,226,180,0.18)]"
          }`}
        />
      </div>

      {/* Moon */}
      <div
        className={`absolute -z-10 w-[58px] h-[58px] -translate-x-1/2 -translate-y-1/2 pointer-events-none ${posTransition}`}
        style={{ left: `${moon.x}%`, top: `${moon.y}%`, opacity: moonOpacity }}
        aria-hidden="true"
      >
        <div
          className="relative w-full h-full rounded-full"
          style={{
            boxShadow: isDarkSky
              ? `0 0 ${18 + illumination * 24}px ${4 + illumination * 6}px rgba(210,220,240,${(0.06 + illumination * 0.14).toFixed(3)})`
              : "none",
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

            {isDarkSky && <circle cx="50" cy="50" r="50" fill="rgba(16, 24, 42, 0.72)" />}

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
      </div>
    </>
  );
}
