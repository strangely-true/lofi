"use client";

import { useEffect, useRef } from "react";
import type { SkyPhase, WeatherInfo } from "../lib/types";

interface WeatherParticlesProps {
  weather: WeatherInfo | null;
  phase: SkyPhase;
}

interface RainDrop {
  x: number;
  y: number;
  len: number;
  speed: number;
  opacity: number;
  width: number;
  layer: number; // 0 = far, 1 = mid, 2 = near
}

interface Splash {
  x: number;
  y: number;
  r: number;
  maxR: number;
  alpha: number;
}

interface SnowFlake {
  x: number;
  y: number;
  r: number;
  speed: number;
  opacity: number;
  phase: number;
  sway: number;
}

interface HazeMote {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  opacity: number;
}

interface LightningBolt {
  points: Array<{ x: number; y: number }>;
  branches: Array<Array<{ x: number; y: number }>>;
  alpha: number;
}

function buildBolt(width: number, height: number): LightningBolt {
  const startX = width * (0.18 + Math.random() * 0.64);
  const endY = height * (0.42 + Math.random() * 0.25);
  const points: Array<{ x: number; y: number }> = [{ x: startX, y: 0 }];
  const branches: Array<Array<{ x: number; y: number }>> = [];
  let cx = startX;
  let cy = 0;
  const steps = 10 + Math.floor(Math.random() * 6);
  const stepY = endY / steps;

  for (let i = 1; i <= steps; i++) {
    cx += (Math.random() - 0.5) * 46;
    cy = i * stepY;
    points.push({ x: cx, y: cy });

    if (i > 2 && i < steps - 1 && Math.random() < 0.35) {
      const branch: Array<{ x: number; y: number }> = [{ x: cx, y: cy }];
      let bx = cx;
      let by = cy;
      const dir = Math.random() < 0.5 ? -1 : 1;
      for (let b = 0; b < 4; b++) {
        bx += dir * (10 + Math.random() * 22);
        by += 14 + Math.random() * 20;
        branch.push({ x: bx, y: by });
      }
      branches.push(branch);
    }
  }
  return { points, branches, alpha: 0.95 };
}

export function WeatherParticles({ weather, phase }: WeatherParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const code = weather?.weatherCode ?? 0;
  const windSpeed = weather?.windSpeed ?? 0;
  const aqi = weather?.aqi ?? 0;

  const isDrizzle = code >= 51 && code <= 57;
  const isLightRain = code === 61 || code === 80;
  const isModRain = code === 63 || code === 81 || code === 66;
  const isThunder = code >= 95;
  const isHail = code === 96 || code === 99;
  const isHeavyRain = code === 65 || code === 67 || code === 82 || isThunder;
  const showRain = isDrizzle || isLightRain || isModRain || isHeavyRain;

  const isSnow = (code >= 71 && code <= 77) || code === 85 || code === 86;
  const isHeavySnow = code === 75 || code === 86;
  const isFog = code === 45 || code === 48;
  const isOvercast = code === 3 || showRain || isSnow || isFog;
  const showWind = !showRain && !isSnow && windSpeed >= 18;

  // AQI smog severity (0 to 1)
  const smogLevel = aqi > 50 ? Math.min(1, (aqi - 50) / 250) : 0;

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

    // Rain setup (3 parallax depth layers)
    const rainCount = isHeavyRain ? 220 : isModRain ? 140 : isLightRain ? 85 : isDrizzle ? 55 : 0;
    const windSlant = Math.min(9, 1.4 + windSpeed / 12);
    const rainDrops: RainDrop[] = Array.from({ length: rainCount }, () => {
      const r = Math.random();
      const layer = r < 0.45 ? 0 : r < 0.8 ? 1 : 2;
      const baseSpeed = isDrizzle ? 8 : isHeavyRain ? 18 : 13;
      return {
        x: Math.random() * (width + 160) - 80,
        y: Math.random() * height,
        layer,
        len: (isDrizzle ? 7 : 12) + layer * 7 + Math.random() * 8,
        speed: baseSpeed + layer * 4.5 + Math.random() * 4,
        opacity: (isDrizzle ? 0.1 : 0.12) + layer * 0.11 + Math.random() * 0.08,
        width: layer === 2 ? 1.35 : layer === 1 ? 1.0 : 0.7,
      };
    });

    const splashes: Splash[] = [];

    // Snow setup
    const snowCount = isSnow ? (isHeavySnow ? 130 : 75) : 0;
    const snowFlakes: SnowFlake[] = Array.from({ length: snowCount }, () => {
      const layer = Math.random();
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r: 1.1 + layer * 2.6,
        speed: 0.6 + layer * 1.4 + Math.random() * 0.6,
        opacity: 0.25 + layer * 0.55,
        phase: Math.random() * Math.PI * 2,
        sway: 0.35 + layer * 0.6,
      };
    });

    // Wind streaks setup
    const moteCount = showWind ? 32 : 0;
    const motes: HazeMote[] = Array.from({ length: moteCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height * 0.88,
      r: 28 + Math.random() * 48,
      vx: 4.5 + Math.random() * 5.5,
      vy: (Math.random() - 0.5) * 0.3,
      opacity: 0.07 + Math.random() * 0.12,
    }));

    let flashAlpha = 0;
    let activeBolt: LightningBolt | null = null;
    let nextLightning = performance.now() + 3500 + Math.random() * 7500;

    const tick = (now: number) => {
      ctx.clearRect(0, 0, width, height);

      // Thunderstorm sheet flash & forked lightning bolt
      if (isThunder) {
        if (now >= nextLightning) {
          flashAlpha = 0.26 + Math.random() * 0.2;
          if (Math.random() < 0.65) {
            activeBolt = buildBolt(width, height);
          }
          nextLightning = now + 4500 + Math.random() * 10000;
        }
        if (flashAlpha > 0.005) {
          ctx.fillStyle = `rgba(210, 226, 255, ${flashAlpha.toFixed(3)})`;
          ctx.fillRect(0, 0, width, height);
          flashAlpha *= 0.86;
        }
        if (activeBolt && activeBolt.alpha > 0.02) {
          ctx.save();
          ctx.strokeStyle = `rgba(235, 244, 255, ${activeBolt.alpha.toFixed(3)})`;
          ctx.shadowColor = "rgba(180, 210, 255, 0.9)";
          ctx.shadowBlur = 14;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          activeBolt.points.forEach((pt, idx) => {
            if (idx === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          });
          ctx.stroke();

          ctx.lineWidth = 1;
          for (const br of activeBolt.branches) {
            ctx.beginPath();
            br.forEach((pt, idx) => {
              if (idx === 0) ctx.moveTo(pt.x, pt.y);
              else ctx.lineTo(pt.x, pt.y);
            });
            ctx.stroke();
          }
          ctx.restore();
          activeBolt.alpha *= 0.82;
        }
      }

      // Realistic multi-layer rain + ground/horizon splashes
      if (showRain) {
        ctx.lineCap = "round";
        const splashFloor = height * 0.84;
        for (const d of rainDrops) {
          const dx = -windSlant * (0.6 + d.layer * 0.25);
          ctx.lineWidth = d.width;
          ctx.strokeStyle = isDark
            ? `rgba(195, 218, 255, ${d.opacity})`
            : `rgba(240, 248, 255, ${d.opacity})`;
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x + dx * (d.len / d.speed), d.y + d.len);
          ctx.stroke();

          if (isHail && d.layer === 2 && Math.random() < 0.15) {
            ctx.fillStyle = `rgba(235, 245, 255, ${d.opacity + 0.15})`;
            ctx.beginPath();
            ctx.arc(d.x, d.y, 1.8, 0, Math.PI * 2);
            ctx.fill();
          }

          d.x += dx;
          d.y += d.speed;

          if (d.layer === 2 && d.y >= splashFloor + Math.random() * (height - splashFloor) && splashes.length < 28 && Math.random() < 0.18) {
            splashes.push({
              x: d.x,
              y: Math.min(height - 6, splashFloor + Math.random() * (height * 0.14)),
              r: 1,
              maxR: 4 + Math.random() * 5,
              alpha: 0.28,
            });
          }

          if (d.y > height + 20) {
            d.y = -25 - Math.random() * 40;
            d.x = Math.random() * (width + 180) - 40;
          }
          if (d.x < -80) d.x = width + 40;
        }

        // Render rain splashes
        for (let i = splashes.length - 1; i >= 0; i--) {
          const s = splashes[i];
          ctx.strokeStyle = `rgba(220, 235, 255, ${s.alpha.toFixed(3)})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.ellipse(s.x, s.y, s.r, s.r * 0.35, 0, 0, Math.PI * 2);
          ctx.stroke();
          s.r += 0.45;
          s.alpha *= 0.86;
          if (s.r >= s.maxR || s.alpha < 0.02) {
            splashes.splice(i, 1);
          }
        }
      } else if (isSnow) {
        for (const f of snowFlakes) {
          ctx.fillStyle = `rgba(255, 255, 255, ${f.opacity})`;
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
          ctx.fill();

          f.x += Math.sin(now * 0.0012 + f.phase) * f.sway + (windSpeed > 15 ? 0.6 : 0);
          f.y += f.speed;
          if (f.y > height + 10) {
            f.y = -10;
            f.x = Math.random() * width;
          }
          if (f.x > width + 10) f.x = -10;
          if (f.x < -10) f.x = width + 10;
        }
      }

      // Wind streaks
      if (showWind) {
        ctx.lineWidth = 1;
        ctx.lineCap = "round";
        for (const m of motes) {
          ctx.strokeStyle = `rgba(255, 255, 255, ${m.opacity})`;
          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(m.x + m.r, m.y + 1.5);
          ctx.stroke();
          m.x += m.vx;
          m.y += Math.sin(now * 0.002 + m.x * 0.01) * 0.25;
          if (m.x > width + 60) {
            m.x = -m.r - 20;
            m.y = Math.random() * height * 0.85;
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
  }, [showRain, isDrizzle, isLightRain, isModRain, isHeavyRain, isThunder, isHail, isSnow, isHeavySnow, showWind, windSpeed, isDark]);

  if (!showRain && !isSnow && !isFog && !showWind && !isOvercast && smogLevel <= 0) return null;

  return (
    <div className="absolute inset-0 -z-[5] overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Overcast / Rainy sky atmospheric dimming */}
      {isOvercast && (
        <div
          className="absolute inset-0 transition-opacity duration-[2000ms]"
          style={{
            background: isDark
              ? "linear-gradient(180deg, rgba(10,16,28,0.28) 0%, rgba(18,26,42,0.18) 100%)"
              : "linear-gradient(180deg, rgba(84,96,114,0.28) 0%, rgba(112,124,140,0.22) 100%)",
            opacity: isHeavyRain ? 0.9 : showRain || isSnow ? 0.72 : 0.48,
          }}
        />
      )}

      {/* AQI Smog & Haze gradient (lower sky & horizon only, upper sky stays clear) */}
      {smogLevel > 0 && (
        <div
          className="absolute inset-0 transition-opacity duration-[2000ms]"
          style={{
            background: isDark
              ? `linear-gradient(180deg, transparent 0%, transparent 48%, rgba(76,68,56,${(smogLevel * 0.34).toFixed(3)}) 74%, rgba(92,82,66,${(smogLevel * 0.58).toFixed(3)}) 100%)`
              : `linear-gradient(180deg, transparent 0%, transparent 48%, rgba(186,172,148,${(smogLevel * 0.36).toFixed(3)}) 74%, rgba(196,178,148,${(smogLevel * 0.62).toFixed(3)}) 100%)`,
          }}
        />
      )}

      {/* Fog / Mist layers */}
      {isFog && (
        <>
          <div
            className={`absolute inset-x-0 bottom-0 h-[55%] blur-3xl transition-opacity duration-[2000ms] ${
              isDark ? "bg-slate-300/14" : "bg-white/35"
            }`}
          />
          <div
            className={`absolute inset-x-[-10%] bottom-[18%] h-[28%] blur-3xl animate-cloud-drift transition-opacity duration-[2000ms] ${
              isDark ? "bg-slate-400/12" : "bg-white/24"
            }`}
          />
        </>
      )}

      {/* Particle canvas (rain + splashes, lightning, snow, wind) */}
      {(showRain || isSnow || showWind) && (
        <canvas ref={canvasRef} className="relative w-full h-full block" />
      )}
    </div>
  );
}
