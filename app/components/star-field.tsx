import type { CSSProperties } from "react";
import type { SkyPhase } from "../lib/types";
import type { Star } from "../lib/utils";

export function StarField({
  phase,
  stars,
  dimStars,
  cloudCover = 0,
  aqi = null,
}: {
  phase: SkyPhase;
  stars: Star[];
  dimStars: Star[];
  cloudCover?: number;
  aqi?: number | null;
}) {
  const baseOpacity = phase === "night" ? 1 : phase === "twilight" || phase === "dusk" ? 0.45 : 0;
  // Clouds and heavy smog obscure stars realistically
  const cloudFactor = Math.max(0.15, 1 - (cloudCover / 100) * 0.78);
  const aqiFactor = aqi != null && aqi > 80 ? Math.max(0.25, 1 - (aqi - 80) / 300) : 1;
  const finalOpacity = Number((baseOpacity * cloudFactor * aqiFactor).toFixed(3));

  return (
    <div
      className="absolute inset-0 -z-20 pointer-events-none transition-opacity duration-[2200ms] ease-in-out"
      style={{ opacity: finalOpacity }}
      aria-hidden="true"
    >
      {stars.map((s, i) => (
        <div key={i} className="absolute rounded-full bg-white animate-twinkle"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.size}px`, height: `${s.size}px`, opacity: s.opacity, animationDelay: `${s.delay}s` }} />
      ))}
      {dimStars.map((s, i) => (
        <div key={`d${i}`} className="absolute rounded-full bg-blue-200/70 animate-twinkle-dim"
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.size * 0.6}px`, height: `${s.size * 0.6}px`, opacity: s.opacity * 0.4, animationDelay: `${s.delay + 2}s` }} />
      ))}
    </div>
  );
}

const SHOOTING_STARS = [
  { top: "12%", left: "22%", width: 84, angle: 34, dx: 230, dy: 155, duration: 38, delay: 8 },
  { top: "18%", left: "72%", width: 72, angle: -38, dx: -210, dy: 164, duration: 52, delay: 29 },
];

export function ShootingStars({ phase, cloudCover = 0 }: { phase: SkyPhase; cloudCover?: number }) {
  const visible = phase === "night" && cloudCover < 75;
  return (
    <div className={`absolute inset-0 -z-10 pointer-events-none transition-opacity duration-[2000ms] ${visible ? "opacity-100" : "opacity-0"}`} aria-hidden="true">
      {SHOOTING_STARS.map((s, i) => (
        <div
          key={i}
          className={`absolute h-[1.5px] rounded-full opacity-0 animate-shoot ${
            s.dx >= 0
              ? "bg-gradient-to-l from-white/95 via-white/50 to-transparent"
              : "bg-gradient-to-r from-white/95 via-white/50 to-transparent"
          }`}
          style={{
            top: s.top,
            left: s.left,
            width: `${s.width}px`,
            "--shoot-angle": `${s.angle}deg`,
            "--shoot-dx": `${s.dx}px`,
            "--shoot-dy": `${s.dy}px`,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
