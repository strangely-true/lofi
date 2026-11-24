"use client";

import { useMemo } from "react";
import Particles, { ParticlesProvider } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { SkyPhase, WeatherInfo } from "../lib/types";

type ParticlesOptions = React.ComponentProps<typeof Particles>["options"];

const initEngine = async (engine: Parameters<typeof loadSlim>[0]) => {
  await loadSlim(engine);
};

export function WeatherParticles({
  weather,
  phase,
  rainLevel = 0,
}: {
  weather: WeatherInfo | null;
  phase: SkyPhase;
  rainLevel?: number;
}) {
  const code = weather?.weatherCode ?? 0;
  const isWeatherRain = (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95;
  const isSnow = (code >= 71 && code <= 77) || code === 85 || code === 86;
  const isFog = code === 45 || code === 48;
  const showRain = isWeatherRain || rainLevel >= 25;

  const options = useMemo<ParticlesOptions | null>(() => {
    if (showRain) {
      return {
        fullScreen: { enable: false },
        fpsLimit: 60,
        particles: {
          number: { value: isWeatherRain ? 110 : Math.round(40 + rainLevel * 0.8), density: { enable: true } },
          color: { value: "#ffffff" },
          shape: { type: "circle" },
          opacity: { value: { min: 0.15, max: 0.45 } },
          size: { value: { min: 1, max: 1.8 } },
          move: {
            enable: true,
            direction: "bottom",
            speed: { min: 18, max: 28 },
            straight: true,
            outModes: { default: "out" },
          },
        },
        detectRetina: true,
      };
    }
    if (isSnow) {
      return {
        fullScreen: { enable: false },
        fpsLimit: 60,
        particles: {
          number: { value: 65, density: { enable: true } },
          color: { value: "#ffffff" },
          shape: { type: "circle" },
          opacity: { value: { min: 0.25, max: 0.7 } },
          size: { value: { min: 1.5, max: 4 } },
          wobble: { enable: true, distance: 10, speed: 6 },
          move: {
            enable: true,
            direction: "bottom",
            speed: { min: 1.5, max: 3.5 },
            straight: false,
            outModes: { default: "out" },
          },
        },
        detectRetina: true,
      };
    }
    return null;
  }, [showRain, isWeatherRain, isSnow, rainLevel]);

  if (!showRain && !isSnow && !isFog) return null;

  return (
    <div className="absolute inset-0 -z-[5] overflow-hidden pointer-events-none" aria-hidden="true">
      {options && (
        <ParticlesProvider init={initEngine}>
          <Particles
            id={showRain ? "tsparticles-rain" : "tsparticles-snow"}
            options={options}
            className="w-full h-full"
          />
        </ParticlesProvider>
      )}
      {isFog && (
        <div
          className={`absolute inset-x-0 bottom-0 h-[55%] blur-3xl transition-opacity duration-[2000ms] ${
            phase === "night" || phase === "twilight" || phase === "dusk" ? "bg-slate-400/10" : "bg-white/25"
          }`}
        />
      )}
    </div>
  );
}
