"use client";

import { useEffect, useRef } from "react";
import type { SkyPhase } from "../lib/types";

export type HorizonWaveMode = "calm" | "smooth" | "reactive";

const BASE_Y = 132;

// Smooth mode: 10 points, balanced spectral tilt
const SMOOTH_XS = [0, 160, 320, 480, 640, 800, 960, 1120, 1280, 1440];
const SMOOTH_BINS: [number, number][] = [
  [1, 6],
  [6, 12],
  [12, 20],
  [20, 30],
  [30, 44],
  [44, 62],
  [62, 84],
  [84, 110],
  [110, 140],
  [140, 180],
];

// Reactive mode: 14 points, crisp bass/kick & fast piano transient response
const REACTIVE_XS = [0, 111, 222, 332, 443, 554, 665, 775, 886, 997, 1108, 1218, 1329, 1440];
const REACTIVE_BINS: [number, number][] = [
  [0, 2],
  [1, 3],
  [3, 5],
  [5, 7],
  [7, 10],
  [10, 14],
  [14, 19],
  [19, 26],
  [26, 35],
  [35, 46],
  [46, 60],
  [60, 78],
  [78, 98],
  [98, 124],
];

/** Convert control points into a smooth C1-continuous SVG cubic bezier path closed at bottom. */
function buildWavePath(xs: number[], ys: number[]): string {
  const n = xs.length;
  let d = `M${xs[0]},${ys[0].toFixed(2)}`;
  for (let i = 0; i < n - 1; i++) {
    const p0x = xs[Math.max(0, i - 1)];
    const p0y = ys[Math.max(0, i - 1)];
    const p1x = xs[i];
    const p1y = ys[i];
    const p2x = xs[i + 1];
    const p2y = ys[i + 1];
    const p3x = xs[Math.min(n - 1, i + 2)];
    const p3y = ys[Math.min(n - 1, i + 2)];

    const cp1x = p1x + (p2x - p0x) / 6;
    const cp1y = p1y + (p2y - p0y) / 6;
    const cp2x = p2x - (p3x - p1x) / 6;
    const cp2y = p2y - (p3y - p1y) / 6;

    d += ` C${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2x},${p2y.toFixed(1)}`;
  }
  return `${d} L1440,200 L0,200 Z`;
}

const CALM_BACK_PATH =
  "M0,125 C240,85 460,145 740,108 C1020,72 1240,130 1440,96 L1440,200 L0,200 Z";
const CALM_FRONT_PATH =
  "M0,152 C320,124 580,174 920,138 C1160,114 1320,148 1440,136 L1440,200 L0,200 Z";
const FLAT_REST_PATH = `M0,${BASE_Y} L1440,${BASE_Y} L1440,200 L0,200 Z`;

export function Horizon({
  phase,
  analyser,
  isPlaying = false,
  volume = 55,
  waveMode = "calm",
}: {
  phase: SkyPhase;
  analyser: AnalyserNode | null;
  isPlaying?: boolean;
  volume?: number;
  waveMode?: HorizonWaveMode;
}) {
  const backRef = useRef<SVGPathElement>(null);
  const frontRef = useRef<SVGPathElement>(null);
  const ampRef = useRef(0);
  const smoothedRef = useRef<number[]>(new Array(REACTIVE_XS.length).fill(0));

  useEffect(() => {
    let raf = 0;

    if (waveMode === "calm") {
      const targetAmp = isPlaying ? Math.max(0.2, volume / 100) : 0;

      const tickCalm = (t: number) => {
        ampRef.current += (targetAmp - ampRef.current) * 0.04;
        const a = ampRef.current;

        if (a > 0.002) {
          const s = t * 0.001;
          const b1 = Math.sin(s * 1.3) * 2.4 * a;
          const b2 = Math.cos(s * 0.9 + 1.1) * 2.8 * a;
          const b3 = Math.sin(s * 1.7 + 2.2) * 2.2 * a;

          const f1 = Math.sin(s * 2.1 + 0.5) * 3.6 * a;
          const f2 = Math.cos(s * 1.4 + 1.8) * 4.2 * a;
          const f3 = Math.sin(s * 2.5 + 3.0) * 3.2 * a;

          if (backRef.current) {
            backRef.current.setAttribute(
              "d",
              `M0,${(125 + b1).toFixed(2)} C240,${(85 + b2).toFixed(2)} 460,${(145 - b1).toFixed(2)} 740,${(108 + b3).toFixed(2)} C1020,${(72 - b2).toFixed(2)} 1240,${(130 + b1).toFixed(2)} 1440,${(96 + b3).toFixed(2)} L1440,200 L0,200 Z`
            );
          }
          if (frontRef.current) {
            frontRef.current.setAttribute(
              "d",
              `M0,${(152 + f1).toFixed(2)} C320,${(124 + f2).toFixed(2)} 580,${(174 - f1).toFixed(2)} 920,${(138 + f3).toFixed(2)} C1160,${(114 - f2).toFixed(2)} 1320,${(148 + f1).toFixed(2)} 1440,${(136 + f3).toFixed(2)} L1440,200 L0,200 Z`
            );
          }
          raf = requestAnimationFrame(tickCalm);
        } else {
          ampRef.current = 0;
          if (backRef.current) backRef.current.setAttribute("d", CALM_BACK_PATH);
          if (frontRef.current) frontRef.current.setAttribute("d", CALM_FRONT_PATH);
        }
      };

      if (isPlaying || ampRef.current > 0.002) {
        raf = requestAnimationFrame(tickCalm);
      } else {
        if (backRef.current) backRef.current.setAttribute("d", CALM_BACK_PATH);
        if (frontRef.current) frontRef.current.setAttribute("d", CALM_FRONT_PATH);
      }
      return () => cancelAnimationFrame(raf);
    }

    // Spectrum modes ("smooth" or "reactive") on the upper ridge only
    if (frontRef.current) frontRef.current.setAttribute("d", CALM_FRONT_PATH);
    const isReactive = waveMode === "reactive";
    const xs = isReactive ? REACTIVE_XS : SMOOTH_XS;
    const binRanges = isReactive ? REACTIVE_BINS : SMOOTH_BINS;
    const bins = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;

    const tickSpectrum = () => {
      let anyMotion = false;
      const ys = new Array<number>(xs.length);

      if (analyser && bins && isPlaying) {
        analyser.getByteFrequencyData(bins);
      }

      for (let i = 0; i < xs.length; i++) {
        let target = 0;
        if (bins && isPlaying) {
          const [start, end] = binRanges[i];
          let peak = 0;
          let sum = 0;
          const clampedEnd = Math.min(bins.length, end);
          const count = Math.max(1, clampedEnd - start);
          for (let b = start; b < clampedEnd; b++) {
            const val = bins[b];
            sum += val;
            if (val > peak) peak = val;
          }
          const avg = sum / (count * 255);
          const pk = peak / 255;

          if (isReactive) {
            const raw = avg * 0.3 + pk * 0.7;
            const weight = i < 2 ? 0.68 : i < 5 ? 1.0 : i < 9 ? 1.35 : 1.75;
            const gated = Math.max(0, raw * weight - 0.14) / 0.86;
            target = Math.min(1, Math.pow(gated, 1.35));
          } else {
            const raw = avg * 0.55 + pk * 0.45;
            const weight = i < 2 ? 0.55 : i < 4 ? 0.78 : i < 7 ? 1.15 : 1.55;
            target = Math.min(1, Math.pow(raw * weight, 1.1));
          }
        }

        const prev = smoothedRef.current[i];
        const attack = isReactive ? 0.85 : 0.36;
        const release = isReactive ? 0.07 : 0.045;
        const next = prev + (target - prev) * (target > prev ? attack : release);
        smoothedRef.current[i] = next;

        if (next > 0.002) anyMotion = true;

        ys[i] = BASE_Y - next * (isReactive ? 52 : 46);
      }

      if (backRef.current) {
        backRef.current.setAttribute("d", buildWavePath(xs, ys));
      }

      if (isPlaying || anyMotion) {
        raf = requestAnimationFrame(tickSpectrum);
      } else if (backRef.current) {
        backRef.current.setAttribute("d", FLAT_REST_PATH);
      }
    };

    if (isPlaying || smoothedRef.current.some((v) => v > 0.002)) {
      raf = requestAnimationFrame(tickSpectrum);
    } else if (backRef.current) {
      backRef.current.setAttribute("d", FLAT_REST_PATH);
    }

    return () => cancelAnimationFrame(raf);
  }, [waveMode, analyser, isPlaying, volume]);

  const isDark = phase === "night" || phase === "twilight" || phase === "dusk";
  const isGolden = phase === "dawn" || phase === "golden";

  const backFill = isDark
    ? "rgba(8, 13, 26, 0.42)"
    : isGolden
      ? "rgba(48, 32, 42, 0.22)"
      : "rgba(32, 48, 62, 0.16)";

  const frontFill = isDark
    ? "rgba(5, 9, 18, 0.68)"
    : isGolden
      ? "rgba(34, 22, 32, 0.34)"
      : "rgba(22, 34, 46, 0.24)";

  return (
    <div
      className="absolute inset-x-0 bottom-0 h-[18vh] min-h-[100px] max-h-[190px] -z-[4] pointer-events-none select-none overflow-hidden"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 200"
        preserveAspectRatio="none"
        className="w-full h-full block"
      >
        <path
          ref={backRef}
          d={waveMode === "calm" ? CALM_BACK_PATH : FLAT_REST_PATH}
          fill={backFill}
          className="transition-[fill] duration-[2000ms]"
        />
        <path
          ref={frontRef}
          d={CALM_FRONT_PATH}
          fill={frontFill}
          className="transition-[fill] duration-[2000ms]"
        />
      </svg>
    </div>
  );
}
