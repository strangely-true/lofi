import type { WeatherInfo, SkyPhase } from "../lib/types";

interface Drop {
  left: string;
  delay: string;
  duration: string;
  opacity: number;
}

const DROPS: Drop[] = Array.from({ length: 36 }, (_, i) => {
  const seed = (i * 73 + 19) % 100;
  return {
    left: `${(i * 2.8 + (seed % 3)) % 100}%`,
    delay: `${((seed % 20) * 0.15).toFixed(2)}s`,
    duration: `${(0.75 + (seed % 7) * 0.08).toFixed(2)}s`,
    opacity: 0.15 + (seed % 5) * 0.06,
  };
});

const FLAKES: Drop[] = Array.from({ length: 28 }, (_, i) => {
  const seed = (i * 59 + 11) % 100;
  return {
    left: `${(i * 3.6 + (seed % 4)) % 100}%`,
    delay: `${((seed % 25) * 0.25).toFixed(2)}s`,
    duration: `${(5 + (seed % 6) * 0.9).toFixed(2)}s`,
    opacity: 0.25 + (seed % 5) * 0.1,
  };
});

export function WeatherParticles({ weather, phase }: { weather: WeatherInfo | null; phase: SkyPhase }) {
  if (!weather) return null;
  const code = weather.weatherCode;
  const isRain = (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95;
  const isSnow = (code >= 71 && code <= 77) || code === 85 || code === 86;
  const isFog = code === 45 || code === 48;

  if (!isRain && !isSnow && !isFog) return null;

  return (
    <div className="absolute inset-0 -z-[5] overflow-hidden pointer-events-none" aria-hidden="true">
      {isRain &&
        DROPS.map((d, i) => (
          <div
            key={i}
            className="absolute -top-10 w-[1px] h-10 bg-gradient-to-b from-transparent via-white/60 to-white/10 animate-rain-fall"
            style={{ left: d.left, opacity: d.opacity, animationDelay: d.delay, animationDuration: d.duration }}
          />
        ))}

      {isSnow &&
        FLAKES.map((f, i) => (
          <div
            key={i}
            className="absolute -top-4 w-1.5 h-1.5 rounded-full bg-white/80 blur-[0.5px] animate-snow-fall"
            style={{ left: f.left, opacity: f.opacity, animationDelay: f.delay, animationDuration: f.duration }}
          />
        ))}

      {isFog && (
        <div
          className={`absolute inset-x-0 bottom-0 h-[55%] blur-3xl transition-opacity duration-[2000ms] ${
            phase === "night" ? "bg-slate-400/10" : "bg-white/25"
          }`}
        />
      )}
    </div>
  );
}
