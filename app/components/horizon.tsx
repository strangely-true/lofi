"use client";

import { useEffect, useRef } from "react";
import type { SkyPhase } from "../lib/types";

export type HorizonWaveMode = "calm" | "reactive";

// 10 evenly spaced points along 0..1440; resting state is a flat line at y = 140
const XS = [0, 160, 320, 480, 640, 800, 960, 1120, 1280, 1440];
const BASE_Y = 140;

const BIN_RANGES: [number, number][] = [
  [1, 3],
  [3, 5],
  [5, 8],
  [8, 12],
  [12, 17],
  [17, 23],
  [23, 30],
  [30, 38],
  [38, 46],
  [46, 56],
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
const REACTIVE_REST_PATH = `M0,${BASE_Y} L1440,${BASE_Y} L1440,200 L0,200 Z`;

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
  const smoothedRef = useRef<number[]>(new Array(XS.length).fill(0));

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

    // Reactive mode: subtle, balanced FFT wave on the upper ridge only
    if (frontRef.current) frontRef.current.setAttribute("d", CALM_FRONT_PATH);
    const bins = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;

    const tickReactive = () => {
      let anyMotion = false;
      const ys = new Array<number>(XS.length);

      if (analyser && bins && isPlaying) {
        analyser.getByteFrequencyData(bins);
      }

      for (let i = 0; i < XS.length; i++) {
        let target = 0;
        if (bins && isPlaying) {
          const [start, end] = BIN_RANGES[i];
          let sum = 0;
          let peak = 0;
          const clampedEnd = Math.min(bins.length, end);
          const count = Math.max(1, clampedEnd - start);
          for (let b = start; b < clampedEnd; b++) {
            const val = bins[b];
            sum += val;
            if (val > peak) peak = val;
          }
          const avg = sum / (count * 255);
          const pk = peak / 255;
          const raw = avg * 0.55 + pk * 0.45;
          // Perceptual spectral tilt: tame sub-bass dominance on the left while lifting mids & treble
          const weight = i < 2 ? 0.55 : i < 4 ? 0.78 : i < 7 ? 1.15 : 1.55;
          target = Math.min(1, Math.pow(raw * weight, 1.1));
        }

        // Responsive attack on beats, slow graceful decay on pause or between tracks
        const prev = smoothedRef.current[i];
        const lerp = target > prev ? 0.36 : 0.045;
        const next = prev + (target - prev) * lerp;
        smoothedRef.current[i] = next;

        if (next > 0.002) anyMotion = true;

        // Balanced expressive height (up to 46px above baseline)
        ys[i] = BASE_Y - next * 46;
      }

      if (backRef.current) {
        backRef.current.setAttribute("d", buildWavePath(XS, ys));
      }

      if (isPlaying || anyMotion) {
        raf = requestAnimationFrame(tickReactive);
      } else if (backRef.current) {
        backRef.current.setAttribute("d", REACTIVE_REST_PATH);
      }
    };

    if (isPlaying || smoothedRef.current.some((v) => v > 0.002)) {
      raf = requestAnimationFrame(tickReactive);
    } else if (backRef.current) {
      backRef.current.setAttribute("d", REACTIVE_REST_PATH);
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
          d={waveMode === "calm" ? CALM_BACK_PATH : REACTIVE_REST_PATH}
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
