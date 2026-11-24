import type { SkyPhase } from "../lib/types";

export function Character({ phase }: { phase: SkyPhase }) {
  const isNight = phase === "night";

  return (
    <div
      className="absolute z-[2] left-6 bottom-0 w-[clamp(140px,15vw,220px)] pointer-events-none select-none max-md:left-2 max-md:w-[110px] max-md:opacity-80"
      aria-hidden="true"
    >
      {/* Night: stargazing */}
      <img
        src="/character-night.png"
        alt=""
        className={`w-full h-auto object-contain transition-opacity duration-[1800ms] ease-in-out drop-shadow-[0_12px_28px_rgba(0,0,0,0.35)] ${
          isNight ? "opacity-95" : "opacity-0"
        }`}
      />
      {/* Day / Dawn / Golden: sunbathing */}
      <img
        src="/character-day.png"
        alt=""
        className={`absolute inset-0 w-full h-auto object-contain transition-opacity duration-[1800ms] ease-in-out drop-shadow-[0_12px_28px_rgba(0,0,0,0.2)] ${
          isNight ? "opacity-0" : "opacity-95"
        }`}
      />
    </div>
  );
}
