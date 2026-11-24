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

export function ShootingStars({ phase }: { phase: SkyPhase }) {
  return (
    <div className={`absolute inset-0 -z-10 pointer-events-none transition-opacity duration-[2000ms] ${phase === "night" ? "opacity-100" : "opacity-0"}`} aria-hidden="true">
      <div className="absolute top-[12%] left-[20%] w-20 h-[1.5px] rounded-[50px] bg-gradient-to-r from-white/90 to-transparent opacity-0 -rotate-[35deg] animate-shoot" />
      <div className="absolute top-[25%] left-[55%] w-15 h-[1.5px] rounded-[50px] bg-gradient-to-r from-white/90 to-transparent opacity-0 -rotate-[40deg] animate-shoot" style={{ animationDuration: "8s", animationDelay: "7s" }} />
      <div className="absolute top-[8%] left-[72%] w-25 h-[1.5px] rounded-[50px] bg-gradient-to-r from-white/90 to-transparent opacity-0 -rotate-[30deg] animate-shoot" style={{ animationDuration: "10s", animationDelay: "12s" }} />
    </div>
  );
}
