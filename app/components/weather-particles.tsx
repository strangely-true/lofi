"use client";

import { useEffect, useRef } from "react";
import type { SkyPhase, WeatherInfo } from "../lib/types";

interface WeatherParticlesProps {
  weather: WeatherInfo | null;
  phase: SkyPhase;
}

interface Drop {
  x: number;
  y: number;
  len: number;
  speed: number;
  opacity: number;
  drift: number;
  size: number;
}

export function WeatherParticles({
  weather,
  phase,
}: WeatherParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const code = weather?.weatherCode ?? 0;
  const windSpeed = weather?.windSpeed ?? 0;
  const isThunder = code >= 95;
  const isHeavyRain = code === 65 || code === 82 || isThunder;
  const showRain = (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || isThunder;
  const isSnow = (code >= 71 && code <= 77) || code === 85 || code === 86;
  const isFog = code === 45 || code === 48;
  const showWind = !showRain && !isSnow && windSpeed >= 18;

  const isDark = phase === "night" || phase === "twilight" || phase === "dusk";

  useEffect(() => {
    if (!showRain && !isSnow && !showWind) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    const count = showRain
      ? isHeavyRain
        ? 160
        : 100
      : isSnow
        ? 75
        : 28;

    const particles: Drop[] = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      len: showRain ? 12 + Math.random() * 16 : showWind ? 32 + Math.random() * 48 : 0,
      speed: showRain
        ? (isHeavyRain ? 16 : 11) + Math.random() * 8
        : isSnow
          ? 0.8 + Math.random() * 1.6
          : 4 + Math.random() * 5,
      opacity: showRain
        ? 0.16 + Math.random() * 0.28
        : isSnow
          ? 0.35 + Math.random() * 0.45
          : 0.08 + Math.random() * 0.14,
      drift: showRain ? -1.8 - (windSpeed / 25) : isSnow ? (Math.random() - 0.5) * 0.8 : 0,
      size: isSnow ? 1.5 + Math.random() * 2.5 : 1,
    }));

    let lightningAlpha = 0;
    let nextLightning = performance.now() + 4000 + Math.random() * 8000;

    const tick = (now: number) => {
      ctx.clearRect(0, 0, width, height);

      if (isThunder) {
        if (now >= nextLightning) {
          lightningAlpha = 0.28 + Math.random() * 0.22;
          nextLightning = now + 5000 + Math.random() * 11000;
        }
        if (lightningAlpha > 0.005) {
          ctx.fillStyle = `rgba(215, 228, 255, ${lightningAlpha.toFixed(3)})`;
          ctx.fillRect(0, 0, width, height);
          lightningAlpha *= 0.86;
        }
      }

      if (showRain) {
        ctx.lineWidth = isHeavyRain ? 1.3 : 1;
        ctx.lineCap = "round";
        for (const p of particles) {
          ctx.strokeStyle = isDark
            ? `rgba(205, 225, 255, ${p.opacity})`
            : `rgba(255, 255, 255, ${p.opacity})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.drift * 1.4, p.y + p.len);
          ctx.stroke();

          p.x += p.drift;
          p.y += p.speed;
          if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * (width + 80);
          }
          if (p.x < -40) p.x = width + 20;
        }
      } else if (isSnow) {
        for (const p of particles) {
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();

          p.x += p.drift + Math.sin(now * 0.001 + p.y * 0.02) * 0.4;
          p.y += p.speed;
          if (p.y > height + 10) {
            p.y = -10;
            p.x = Math.random() * width;
          }
          if (p.x > width + 10) p.x = -10;
          if (p.x < -10) p.x = width + 10;
        }
      } else if (showWind) {
        ctx.lineWidth = 1;
        ctx.lineCap = "round";
        for (const p of particles) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${p.opacity})`;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.len, p.y + 2);
          ctx.stroke();

          p.x += p.speed;
          p.y += Math.sin(now * 0.002 + p.x * 0.01) * 0.25;
          if (p.x > width + 60) {
            p.x = -p.len - 20;
            p.y = Math.random() * height * 0.85;
          }
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
    };
  }, [showRain, isSnow, showWind, isHeavyRain, isThunder, windSpeed, isDark]);

  if (!showRain && !isSnow && !isFog && !showWind) return null;

  return (
    <div className="absolute inset-0 -z-[5] overflow-hidden pointer-events-none" aria-hidden="true">
      {(showRain || isSnow || showWind) && (
        <canvas ref={canvasRef} className="w-full h-full block" />
      )}
      {isFog && (
        <>
          <div
            className={`absolute inset-x-0 bottom-0 h-[55%] blur-3xl transition-opacity duration-[2000ms] ${
              isDark ? "bg-slate-300/12" : "bg-white/30"
            }`}
          />
          <div
            className={`absolute inset-x-[-10%] bottom-[18%] h-[28%] blur-3xl animate-cloud-drift transition-opacity duration-[2000ms] ${
              isDark ? "bg-slate-400/10" : "bg-white/20"
            }`}
          />
        </>
      )}
    </div>
  );
}
