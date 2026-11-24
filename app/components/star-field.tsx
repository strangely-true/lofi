import type { CSSProperties } from "react";
import type { SkyPhase } from "../lib/types";
import type { Star } from "../lib/utils";

export function StarField({ phase, stars, dimStars }: { phase: SkyPhase; stars: Star[]; dimStars: Star[] }) {
  return (
    <div className={`absolute inset-0 -z-20 pointer-events-none transition-opacity duration-[2200ms] ease-in-out ${phase === "night" ? "opacity-100" : "opacity-0"}`} aria-hidden="true">
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
  { top: "10%", left: "16%", width: 84, angle: 34, dx: 230, dy: 155, duration: 7, delay: 2 },
  { top: "18%", left: "72%", width: 72, angle: -38, dx: -210, dy: 164, duration: 9, delay: 6 },
  { top: "8%", left: "44%", width: 92, angle: 26, dx: 260, dy: 127, duration: 11, delay: 10 },
  { top: "24%", left: "84%", width: 68, angle: -44, dx: -185, dy: 179, duration: 8.5, delay: 14 },
  { top: "14%", left: "28%", width: 76, angle: 46, dx: 180, dy: 186, duration: 12, delay: 19 },
];

export function ShootingStars({ phase }: { phase: SkyPhase }) {
  return (
    <div className={`absolute inset-0 -z-10 pointer-events-none transition-opacity duration-[2000ms] ${phase === "night" ? "opacity-100" : "opacity-0"}`} aria-hidden="true">
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
