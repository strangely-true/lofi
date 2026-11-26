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
  cloudCover = 0,
}: {
  phase: SkyPhase;
  sun: CelestialBodyPos;
  moon: CelestialBodyPos;
  moonData: MoonData;
  animatePosition?: boolean;
  cloudCover?: number;
}) {
  const litPath = moonLitPath(moonData.phase);
  const illumination = moonData.fraction ?? (1 - Math.cos(2 * Math.PI * moonData.phase)) / 2;
  const brightLimbBaseRotation = moonData.phase < 0.5 ? 0 : 180;
  // SunCalc's position angle is north-through-east; SVG rotations are clockwise in a y-down viewBox.
  const brightLimbRotation = moonData.brightLimbAngleDeg == null
    ? 0
    : -moonData.brightLimbAngleDeg - 90 - brightLimbBaseRotation;
  const isDarkSky = phase === "night" || phase === "twilight" || phase === "dusk";
  const isGolden = phase === "dawn" || phase === "golden";

  // Gentle cloud softening only (AQI/overcast layers in WeatherParticles sit in front)
  const cloudDim = Math.max(0.75, 1 - (cloudCover / 100) * 0.22);

  const moonAmbientOpacity = sun.altitudeDeg >= 0
    ? 0.32
    : sun.altitudeDeg > -6
      ? 0.32 + (-sun.altitudeDeg / 6) * 0.68
      : 1;
  const moonOpacity = moon.visible ? moonAmbientOpacity * cloudDim : 0;
  const sunAltitudeOpacity = 0.65 + 0.35 * Math.min(1, Math.max(0, sun.altitudeDeg) / 8);
  const sunOpacity = sun.visible ? sunAltitudeOpacity * cloudDim : 0;
  const posTransition = animatePosition
    ? "transition-[transform,opacity] duration-[1500ms] ease-out"
    : "transition-opacity duration-700";

  return (
    <>
      {/* Sun */}
      <div
        className={`absolute top-0 left-0 -z-10 w-[72px] h-[72px] pointer-events-none will-change-transform ${posTransition}`}
        style={{
          transform: `translate3d(calc(${sun.x}vw - 50%), calc(${sun.y}vh - 50%), 0)`,
          opacity: sunOpacity,
        }}
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
        className={`absolute top-0 left-0 -z-10 w-[58px] h-[58px] pointer-events-none will-change-transform ${posTransition}`}
        style={{
          transform: `translate3d(calc(${moon.x}vw - 50%), calc(${moon.y}vh - 50%), 0)`,
          opacity: moonOpacity,
        }}
        aria-hidden="true"
      >
        <div
          className="relative w-full h-full rounded-full"
          style={{
            boxShadow: isDarkSky
              ? `0 0 ${22 + illumination * 28}px ${5 + illumination * 7}px rgba(225,232,250,${(0.12 + illumination * 0.22).toFixed(3)})`
              : "none",
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full rounded-full overflow-hidden">
            <defs>
              <radialGradient id="moon-surface" cx="42%" cy="38%" r="60%">
                <stop offset="0%" stopColor="#fcfaf0" />
                <stop offset="65%" stopColor="#f0ecd8" />
                <stop offset="100%" stopColor="#ded9c2" />
              </radialGradient>
              <clipPath id="moon-lit-clip">
                {litPath ? (
                  <path d={litPath} transform={`rotate(${brightLimbRotation} 50 50)`} />
                ) : (
                  <path d="M 0 0" />
                )}
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
