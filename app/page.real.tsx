"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";

/* ─────────────────────────────────────────────────────────
   FEATHER / LUCIDE SVG ICON COMPONENT (Zero-Dep & SSR Safe)
───────────────────────────────────────────────────────── */
type IconName =
  | "sun"
  | "moon"
  | "cloud"
  | "cloud-rain"
  | "cloud-lightning"
  | "wind"
  | "droplets"
  | "sparkles"
  | "play"
  | "pause"
  | "volume"
  | "volume-x"
  | "radio"
  | "timer"
  | "map-pin"
  | "external-link"
  | "chevron-left"
  | "chevron-right"
  | "rotate-ccw"
  | "copy"
  | "check"
  | "flame"
  | "refresh-cw"
  | "maximize"
  | "minimize"
  | "zap";

function Icon({
  name,
  size = 18,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const p: Record<IconName, React.ReactNode> = {
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </>
    ),
    moon: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />,
    cloud: <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />,
    "cloud-rain": (
      <>
        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
        <path d="M16 14v6M8 14v6M12 16v6" />
      </>
    ),
    "cloud-lightning": (
      <>
        <path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973" />
        <path d="m13 12-3 5h4l-3 5" />
      </>
    ),
    wind: <path d="M17.7 7.7A2.5 2.5 0 1 1 19.5 12H2M12.6 19.4A2 2 0 1 0 14 16H2M14.7 4.7A2 2 0 1 1 16 8H2" />,
    droplets: (
      <>
        <path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z" />
        <path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97" />
      </>
    ),
    sparkles: (
      <>
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        <path d="M5 3v4M3 5h4M19 17v4M17 19h4" />
      </>
    ),
    play: <path d="M6 4l15 8-15 8V4Z" fill="currentColor" stroke="none" />,
    pause: (
      <>
        <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none" />
        <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none" />
      </>
    ),
    volume: (
      <>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14" />
      </>
    ),
    "volume-x": (
      <>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <line x1="22" x2="16" y1="9" y2="15" />
        <line x1="16" x2="22" y1="9" y2="15" />
      </>
    ),
    radio: (
      <>
        <path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5M12 12h.01M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5M19.1 4.9C23 8.8 23 15.1 19.1 19" />
      </>
    ),
    timer: (
      <>
        <line x1="10" x2="14" y1="2" y2="2" />
        <line x1="12" x2="12" y1="14" y2="8" />
        <circle cx="12" cy="14" r="8" />
      </>
    ),
    "map-pin": (
      <>
        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
    "external-link": (
      <>
        <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      </>
    ),
    "chevron-left": <path d="m15 18-6-6 6-6" />,
    "chevron-right": <path d="m9 18 6-6-6-6" />,
    "rotate-ccw": (
      <>
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
      </>
    ),
    copy: (
      <>
        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
      </>
    ),
    check: <path d="M20 6 9 17l-5-5" />,
    flame: (
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    ),
    "refresh-cw": (
      <>
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
        <path d="M8 16H3v5" />
      </>
    ),
    maximize: (
      <>
        <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
      </>
    ),
    minimize: (
      <>
        <path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3" />
      </>
    ),
    zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {p[name] || null}
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────
   TYPES & DEFAULT SETTINGS
───────────────────────────────────────────────────────── */
export type SkyTheme =
  | "auto"
  | "dawn"
  | "day"
  | "golden"
  | "sunset"
  | "night"
  | "storm"
  | "aurora"
  | "smog"
  | "overcast";

export type FontChoice = "cormorant" | "inter" | "playfair" | "mono" | "space";

export interface AppSettings {
  showClock: boolean;
  clockFormat12h: boolean;
  showSeconds: boolean;
  showDate: boolean;
  showWeatherInClock: boolean;
  fontChoice: FontChoice;

  skyTheme: SkyTheme;
  ambientGlow: boolean;
  vignette: boolean;

  cloudDensity: "auto" | "clear" | "scattered" | "heavy" | "overcast";
  smogLevel: "auto" | "clean" | "moderate" | "heavy";
  weatherEffect: "auto" | "none" | "rain" | "storm";
  shootingStars: boolean;
  starDensity: "low" | "medium" | "high";

  currentStationId: string;
  customRadioUrl: string;
  volume: number;

  ambientSound: "none" | "rain" | "whitenoise" | "fire";
  ambientVolume: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  showClock: true,
  clockFormat12h: false,
  showSeconds: false,
  showDate: true,
  showWeatherInClock: true,
  fontChoice: "cormorant",

  skyTheme: "auto",
  ambientGlow: true,
  vignette: true,

  cloudDensity: "auto",
  smogLevel: "auto",
  weatherEffect: "auto",
  shootingStars: true,
  starDensity: "medium",

  currentStationId: "groovesalad",
  customRadioUrl: "",
  volume: 55,

  ambientSound: "none",
  ambientVolume: 35,
};

const RADIO_STATIONS = [
  {
    id: "groovesalad",
    name: "SomaFM Groove Salad",
    genre: "Downtempo & Ambient",
    url: "https://ice1.somafm.com/groovesalad-128-mp3",
  },
  {
    id: "deepspace",
    name: "SomaFM Deep Space One",
    genre: "Deep Ambient & Space",
    url: "https://ice1.somafm.com/deepspaceone-128-mp3",
  },
  {
    id: "lush",
    name: "SomaFM Lush",
    genre: "Sensuous Chilled Vocals",
    url: "https://ice1.somafm.com/lush-128-mp3",
  },
  {
    id: "defcon",
    name: "SomaFM DEF CON",
    genre: "Hacker Synth & Lofi",
    url: "https://ice1.somafm.com/defcon-128-mp3",
  },
  {
    id: "nightwave",
    name: "Nightwave Plaza",
    genre: "Vaporwave & Future Funk",
    url: "https://radio.plaza.one/mp3",
  },
  {
    id: "chillhop",
    name: "Chillhop Study Lofi",
    genre: "Lofi Beats & Instrumental",
    url: "https://stream.zeno.fm/f3wvbbqmdg8uv",
  },
];

const PRESETS = [
  { label: "Focus", minutes: 25 },
  { label: "Short", minutes: 5 },
  { label: "Deep", minutes: 50 },
];

const WMO_DESCRIPTIONS: Record<number, { text: string; isRain: boolean; isStorm: boolean }> = {
  0: { text: "Clear sky", isRain: false, isStorm: false },
  1: { text: "Mainly clear", isRain: false, isStorm: false },
  2: { text: "Partly cloudy", isRain: false, isStorm: false },
  3: { text: "Overcast", isRain: false, isStorm: false },
  45: { text: "Foggy", isRain: false, isStorm: false },
  48: { text: "Rime fog", isRain: false, isStorm: false },
  51: { text: "Light drizzle", isRain: true, isStorm: false },
  53: { text: "Moderate drizzle", isRain: true, isStorm: false },
  55: { text: "Dense drizzle", isRain: true, isStorm: false },
  56: { text: "Freezing drizzle", isRain: true, isStorm: false },
  57: { text: "Heavy freezing drizzle", isRain: true, isStorm: false },
  61: { text: "Slight rain", isRain: true, isStorm: false },
  63: { text: "Moderate rain", isRain: true, isStorm: false },
  65: { text: "Heavy rain", isRain: true, isStorm: false },
  66: { text: "Freezing rain", isRain: true, isStorm: false },
  67: { text: "Heavy freezing rain", isRain: true, isStorm: false },
  71: { text: "Slight snow", isRain: false, isStorm: false },
  73: { text: "Moderate snow", isRain: false, isStorm: false },
  75: { text: "Heavy snow", isRain: false, isStorm: false },
  77: { text: "Snow grains", isRain: false, isStorm: false },
  80: { text: "Rain showers", isRain: true, isStorm: false },
  81: { text: "Moderate showers", isRain: true, isStorm: false },
  82: { text: "Violent showers", isRain: true, isStorm: false },
  85: { text: "Snow showers", isRain: false, isStorm: false },
  86: { text: "Heavy snow showers", isRain: false, isStorm: false },
  95: { text: "Thunderstorm", isRain: true, isStorm: true },
  96: { text: "Thunderstorm with hail", isRain: true, isStorm: true },
  99: { text: "Severe thunderstorm", isRain: true, isStorm: true },
};

/* ─────────────────────────────────────────────────────────
   ASTRONOMICAL MOON CALCULATIONS (Accurate Ephemeris)
───────────────────────────────────────────────────────── */
interface MoonData {
  fraction: number; // 0 to 1
  illumination: number; // 0 to 100%
  name: string;
  emoji: string;
  isWaxing: boolean;
}

function getAstronomicalMoon(date: Date): MoonData {
  const synodicMonth = 29.53058867;
  const newMoonRef = Date.UTC(2000, 0, 6, 18, 14, 0);
  const diffDays = (date.getTime() - newMoonRef) / (1000 * 60 * 60 * 24);
  const fraction = (((diffDays % synodicMonth) + synodicMonth) % synodicMonth) / synodicMonth;
  const illumination = Math.round(((1 - Math.cos(fraction * 2 * Math.PI)) / 2) * 100);

  let name = "New Moon";
  let emoji = "🌑";

  if (fraction < 0.03 || fraction >= 0.97) {
    name = "New Moon";
    emoji = "🌑";
  } else if (fraction < 0.22) {
    name = "Waxing Crescent";
    emoji = "🌒";
  } else if (fraction < 0.28) {
    name = "First Quarter";
    emoji = "🌓";
  } else if (fraction < 0.47) {
    name = "Waxing Gibbous";
    emoji = "🌔";
  } else if (fraction < 0.53) {
    name = "Full Moon";
    emoji = "🌕";
  } else if (fraction < 0.72) {
    name = "Waning Gibbous";
    emoji = "🌖";
  } else if (fraction < 0.78) {
    name = "Last Quarter";
    emoji = "🌗";
  } else {
    name = "Waning Crescent";
    emoji = "🌘";
  }

  return {
    fraction,
    illumination,
    name,
    emoji,
    isWaxing: fraction < 0.5,
  };
}

/* ─────────────────────────────────────────────────────────
   STAR FIELD GENERATION
───────────────────────────────────────────────────────── */
function generateStars(count: number, seed: number) {
  const stars: Array<{ x: number; y: number; size: number; opacity: number; delay: number }> = [];
  let s = seed;
  const rng = () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
  for (let i = 0; i < count; i++) {
    stars.push({
      x: rng() * 100,
      y: rng() * 75,
      size: 0.6 + rng() * 1.8,
      opacity: 0.25 + rng() * 0.75,
      delay: rng() * 8,
    });
  }
  return stars;
}

const STARS_LOW = generateStars(60, 101);
const STARS_MED = generateStars(140, 42);
const STARS_HIGH = generateStars(260, 777);

/* ─────────────────────────────────────────────────────────
   IP GEOLOCATION (Zero-Permission Auto Detect)
───────────────────────────────────────────────────────── */
interface LocationInfo {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  source: string;
}

async function fetchLocationByIp(): Promise<LocationInfo | null> {
  try {
    const res = await fetch("https://ipwho.is/", { signal: AbortSignal.timeout(4500) });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.latitude && data.longitude) {
        return {
          city: data.city || data.region || "Local Sky",
          country: data.country || "",
          latitude: data.latitude,
          longitude: data.longitude,
          source: "ipwho",
        };
      }
    }
  } catch {}

  try {
    const res = await fetch("https://freeipapi.com/api/json", { signal: AbortSignal.timeout(4500) });
    if (res.ok) {
      const data = await res.json();
      if (data.cityName && data.latitude) {
        return {
          city: data.cityName,
          country: data.countryName || "",
          latitude: data.latitude,
          longitude: data.longitude,
          source: "freeip",
        };
      }
    }
  } catch {}

  try {
    const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(4500) });
    if (res.ok) {
      const data = await res.json();
      if (data.city && data.latitude) {
        return {
          city: data.city,
          country: data.country_name || "",
          latitude: data.latitude,
          longitude: data.longitude,
          source: "ipapi",
        };
      }
    }
  } catch {}

  return null;
}

/* ─────────────────────────────────────────────────────────
   REALISTIC ASTRONOMICAL MOON SVG COMPONENT
───────────────────────────────────────────────────────── */
function RealisticMoon({ moon }: { moon: MoonData }) {
  const r = 30;
  const cx = 36;
  const cy = 36;
  const f = moon.fraction;
  const isWaxing = moon.isWaxing;

  const angle = f * 2 * Math.PI;
  const curve = -Math.cos(angle);
  const rx = Math.max(0.1, Math.abs(curve) * r);

  const sweep = curve >= 0 ? 1 : 0;
  const baseArc = isWaxing
    ? `M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx} ${cy + r}`
    : `M ${cx} ${cy - r} A ${r} ${r} 0 0 0 ${cx} ${cy + r}`;

  const terminatorArc = `A ${rx} ${r} 0 0 ${isWaxing ? 1 - sweep : sweep} ${cx} ${cy - r}`;
  const litPath = `${baseArc} ${terminatorArc} Z`;

  return (
    <div className="moon-realistic" title={`${moon.name} (${moon.illumination}% illuminated)`}>
      <svg width="72" height="72" viewBox="0 0 72 72" className="moon-svg" aria-hidden="true">
        <defs>
          <radialGradient id="moonGlow" cx="42%" cy="38%" r="60%">
            <stop offset="0%" stopColor="#fffef2" />
            <stop offset="65%" stopColor="#ece6cb" />
            <stop offset="100%" stopColor="#d5ceab" />
          </radialGradient>

          <radialGradient id="earthshine" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1c2438" stopOpacity="0.85" />
            <stop offset="90%" stopColor="#141a29" stopOpacity="0.94" />
          </radialGradient>

          <filter id="moonSoftGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="glow" />
            <feComposite in="SourceGraphic" in2="glow" operator="over" />
          </filter>

          <clipPath id="moonLitClip">
            <path d={litPath} />
          </clipPath>
        </defs>

        <circle cx={cx} cy={cy} r={r + 8} fill="rgba(215, 230, 255, 0.08)" filter="blur(6px)" />
        <circle cx={cx} cy={cy} r={r} fill="url(#earthshine)" />

        <g clipPath="url(#moonLitClip)">
          <circle cx={cx} cy={cy} r={r} fill="url(#moonGlow)" filter="url(#moonSoftGlow)" />
          <path
            d="M 28 26 q 5 -6 12 -2 q 8 5 4 13 q -5 7 -13 4 q -6 -6 -3 -15 Z"
            fill="rgba(120, 115, 95, 0.28)"
            filter="blur(1.2px)"
          />
          <path
            d="M 40 34 q 7 -2 10 5 q 3 8 -5 10 q -8 2 -9 -6 q 0 -7 4 -9 Z"
            fill="rgba(115, 110, 90, 0.24)"
            filter="blur(1.5px)"
          />
          <path
            d="M 24 38 q 4 -5 9 -2 q 5 4 2 8 q -5 6 -9 2 q -3 -4 -2 -8 Z"
            fill="rgba(115, 110, 90, 0.2)"
            filter="blur(1px)"
          />
          <circle cx="34" cy="52" r="3.2" fill="rgba(255,255,255,0.7)" />
          <circle cx="34" cy="52" r="1.8" fill="rgba(140,135,115,0.4)" />
          <circle cx="28" cy="35" r="2.2" fill="rgba(255,255,255,0.6)" />
          <circle cx="28" cy="35" r="1.2" fill="rgba(140,135,115,0.35)" />
        </g>

        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="rgba(255, 255, 255, 0.16)"
          strokeWidth="0.8"
        />
      </svg>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   WEB AUDIO SYNTHESIZER (Ambient Soundscape generator)
───────────────────────────────────────────────────────── */
class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private currentMode: "none" | "rain" | "whitenoise" | "fire" = "none";
  private gainNode: GainNode | null = null;
  private noiseNode: AudioNode | null = null;

  start(mode: "none" | "rain" | "whitenoise" | "fire", volumePercent: number) {
    if (typeof window === "undefined") return;
    this.stop();
    this.currentMode = mode;
    if (mode === "none") return;

    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();
      if (this.ctx.state === "suspended") {
        this.ctx.resume();
      }

      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime((volumePercent / 100) * 0.25, this.ctx.currentTime);
      this.gainNode.connect(this.ctx.destination);

      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.5;
      }

      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      if (mode === "rain") {
        const lowpass = this.ctx.createBiquadFilter();
        lowpass.type = "lowpass";
        lowpass.frequency.setValueAtTime(950, this.ctx.currentTime);

        const highpass = this.ctx.createBiquadFilter();
        highpass.type = "highpass";
        highpass.frequency.setValueAtTime(140, this.ctx.currentTime);

        noiseSource.connect(lowpass);
        lowpass.connect(highpass);
        highpass.connect(this.gainNode);
      } else if (mode === "fire") {
        const filter = this.ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(650, this.ctx.currentTime);
        filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

        noiseSource.connect(filter);
        filter.connect(this.gainNode);
      } else {
        const lowpass = this.ctx.createBiquadFilter();
        lowpass.type = "lowpass";
        lowpass.frequency.setValueAtTime(1800, this.ctx.currentTime);

        noiseSource.connect(lowpass);
        lowpass.connect(this.gainNode);
      }

      noiseSource.start(0);
      this.noiseNode = noiseSource;
    } catch {}
  }

  setVolume(volumePercent: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setTargetAtTime((volumePercent / 100) * 0.25, this.ctx.currentTime, 0.08);
    }
  }

  stop() {
    try {
      if (this.ctx) {
        this.ctx.close();
      }
    } catch {}
    this.ctx = null;
    this.gainNode = null;
    this.noiseNode = null;
    this.currentMode = "none";
  }
}

let ambientSynthInstance: AmbientAudioEngine | null = null;
function getAmbientSynth(): AmbientAudioEngine {
  if (!ambientSynthInstance) {
    ambientSynthInstance = new AmbientAudioEngine();
  }
  return ambientSynthInstance;
}

/* ─────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────── */
export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [settingsDrawerOpen, setSettingsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"clock" | "sky" | "audio" | "json">("sky");
  const [copiedJson, setCopiedJson] = useState(false);
  const [jsonInput, setJsonInput] = useState("");

  const [now, setNow] = useState(() => new Date(0));
  const [solarProgress, setSolarProgress] = useState<number | null>(null);
  const [solarPhase, setSolarPhase] = useState<"dawn" | "day" | "golden" | "sunset" | "night">("day");

  const [location, setLocation] = useState<LocationInfo>({
    city: "Locating…",
    country: "",
    latitude: 0,
    longitude: 0,
    source: "",
  });
  const [locationLoading, setLocationLoading] = useState(false);

  const [cloudCover, setCloudCover] = useState<number>(25);
  const [aqi, setAqi] = useState<number | null>(null);
  const [pm25, setPm25] = useState<number | null>(null);
  const [weatherDesc, setWeatherDesc] = useState<string>("Pleasant");
  const [tempC, setTempC] = useState<number | null>(null);
  const [humidity, setHumidity] = useState<number>(50);
  const [windSpeed, setWindSpeed] = useState<number>(10);
  const [isRainingNow, setIsRainingNow] = useState<boolean>(false);
  const [isStormingNow, setIsStormingNow] = useState<boolean>(false);

  const [timerMode, setTimerMode] = useState(false);
  const [duration, setDuration] = useState(25 * 60);
  const [remaining, setRemaining] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("30");

  const [isPlaying, setIsPlaying] = useState(false);
  const [radioDockOpen, setRadioDockOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setMounted(true);
    setNow(new Date());

    try {
      const stored = localStorage.getItem("still_lofi_settings_v2");
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch {}

    const clockTimer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(clockTimer);
  }, []);

  const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value };
      try {
        localStorage.setItem("still_lofi_settings_v2", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.setItem("still_lofi_settings_v2", JSON.stringify(DEFAULT_SETTINGS));
    } catch {}
  }, []);

  const loadLocationAndWeather = useCallback(async () => {
    setLocationLoading(true);
    const loc = await fetchLocationByIp();
    if (loc) {
      setLocation(loc);

      try {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&daily=sunrise,sunset&current=temperature_2m,relative_humidity_2m,weather_code,cloud_cover,wind_speed_10m&timezone=auto&forecast_days=1`;
        const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${loc.latitude}&longitude=${loc.longitude}&current=pm2_5,us_aqi`;

        const [wRes, aqiRes] = await Promise.allSettled([
          fetch(weatherUrl).then((r) => r.json()),
          fetch(aqiUrl).then((r) => r.json()),
        ]);

        if (wRes.status === "fulfilled" && wRes.value) {
          const data = wRes.value;
          if (data.current) {
            setCloudCover(data.current.cloud_cover ?? 25);
            setTempC(Math.round(data.current.temperature_2m ?? 22));
            setHumidity(Math.round(data.current.relative_humidity_2m ?? 50));
            setWindSpeed(Math.round(data.current.wind_speed_10m ?? 8));

            const code = data.current.weather_code ?? 0;
            const wmo = WMO_DESCRIPTIONS[code] || { text: "Fair", isRain: false, isStorm: false };
            setWeatherDesc(wmo.text);
            setIsRainingNow(wmo.isRain);
            setIsStormingNow(wmo.isStorm);
          }

          const sunrise = data.daily?.sunrise?.[0];
          const sunset = data.daily?.sunset?.[0];
          if (sunrise && sunset) {
            const rise = new Date(sunrise);
            const set = new Date(sunset);
            const riseMin = rise.getHours() * 60 + rise.getMinutes();
            const setMin = set.getHours() * 60 + set.getMinutes();
            const cur = new Date();
            const curMin = cur.getHours() * 60 + cur.getMinutes();

            const progress = ((curMin - riseMin) / (setMin - riseMin)) * 100;
            setSolarProgress(Math.max(0, Math.min(100, progress)));

            if (curMin >= riseMin - 60 && curMin < riseMin + 75) {
              setSolarPhase("dawn");
            } else if (curMin >= setMin - 75 && curMin < setMin + 20) {
              setSolarPhase("golden");
            } else if (curMin >= setMin + 20 && curMin < setMin + 80) {
              setSolarPhase("sunset");
            } else if (curMin >= setMin + 80 || curMin < riseMin - 60) {
              setSolarPhase("night");
            } else {
              setSolarPhase("day");
            }
          }
        }

        if (aqiRes.status === "fulfilled" && aqiRes.value?.current) {
          const aqiData = aqiRes.value.current;
          setAqi(aqiData.us_aqi ? Math.round(aqiData.us_aqi) : null);
          setPm25(aqiData.pm2_5 ? Math.round(aqiData.pm2_5) : null);
        }
      } catch {}
    } else {
      setLocation({
        city: "Local sky",
        country: "",
        latitude: 0,
        longitude: 0,
        source: "fallback",
      });
    }
    setLocationLoading(false);
  }, []);

  useEffect(() => {
    loadLocationAndWeather();
  }, [loadLocationAndWeather]);

  useEffect(() => {
    if (!mounted) return;
    const synth = getAmbientSynth();
    synth.start(settings.ambientSound, settings.ambientVolume);
    return () => synth.stop();
  }, [mounted, settings.ambientSound, settings.ambientVolume]);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = window.setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning]);

  const activeStation = useMemo(() => {
    if (settings.customRadioUrl) {
      return {
        id: "custom",
        name: "Custom Stream",
        genre: "User Provided URL",
        url: settings.customRadioUrl,
      };
    }
    return (
      RADIO_STATIONS.find((s) => s.id === settings.currentStationId) || RADIO_STATIONS[0]
    );
  }, [settings.currentStationId, settings.customRadioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = settings.volume / 100;
    }
  }, [settings.volume]);

  async function toggleRadio() {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    }
  }

  useEffect(() => {
    const handleFs = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFs);
    return () => document.removeEventListener("fullscreenchange", handleFs);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const moon = useMemo(() => getAstronomicalMoon(now), [now]);

  const decimalHour = now.getHours() + now.getMinutes() / 60;
  let fallbackPhase: "dawn" | "day" | "golden" | "sunset" | "night" = "day";
  if (decimalHour >= 5 && decimalHour < 7.2) fallbackPhase = "dawn";
  else if (decimalHour >= 16.8 && decimalHour < 18.8) fallbackPhase = "golden";
  else if (decimalHour >= 18.8 && decimalHour < 20.2) fallbackPhase = "sunset";
  else if (decimalHour >= 20.2 || decimalHour < 5) fallbackPhase = "night";

  const currentPhase = solarPhase ?? fallbackPhase;

  const activeSkyTheme = useMemo<SkyTheme>(() => {
    if (settings.skyTheme !== "auto") return settings.skyTheme;
    if (isStormingNow) return "storm";
    return currentPhase;
  }, [settings.skyTheme, isStormingNow, currentPhase]);

  const sunProgress =
    solarProgress ?? Math.max(0, Math.min(100, ((decimalHour - 6) / 13) * 100));

  const resolvedCloudCover = useMemo(() => {
    if (settings.cloudDensity === "clear") return 5;
    if (settings.cloudDensity === "scattered") return 35;
    if (settings.cloudDensity === "heavy") return 75;
    if (settings.cloudDensity === "overcast") return 95;
    return cloudCover;
  }, [settings.cloudDensity, cloudCover]);

  const isSmoggy = useMemo(() => {
    if (settings.smogLevel === "clean") return false;
    if (settings.smogLevel === "moderate" || settings.smogLevel === "heavy") return true;
    if (activeSkyTheme === "smog") return true;
    return (aqi !== null && aqi >= 115) || (pm25 !== null && pm25 >= 38);
  }, [settings.smogLevel, activeSkyTheme, aqi, pm25]);

  const smogIntensityClass = useMemo(() => {
    if (settings.smogLevel === "heavy") return "smog-heavy";
    if (settings.smogLevel === "moderate") return "smog-moderate";
    if (aqi && aqi >= 170) return "smog-heavy";
    return "smog-moderate";
  }, [settings.smogLevel, aqi]);

  const showRain = useMemo(() => {
    if (settings.weatherEffect === "rain" || settings.weatherEffect === "storm") return true;
    if (settings.weatherEffect === "none") return false;
    if (activeSkyTheme === "storm") return true;
    return isRainingNow || isStormingNow;
  }, [settings.weatherEffect, activeSkyTheme, isRainingNow, isStormingNow]);

  const showLightning = useMemo(() => {
    if (settings.weatherEffect === "storm" || activeSkyTheme === "storm") return true;
    if (settings.weatherEffect === "none") return false;
    return isStormingNow;
  }, [settings.weatherEffect, activeSkyTheme, isStormingNow]);

  const activeStars = useMemo(() => {
    if (settings.starDensity === "low") return STARS_LOW;
    if (settings.starDensity === "high") return STARS_HIGH;
    return STARS_MED;
  }, [settings.starDensity]);

  const formattedTime = useMemo(() => {
    if (!mounted) return { timeStr: "--:--", ampm: "" };
    let h = now.getHours();
    const m = now.getMinutes().toString().padStart(2, "0");
    const s = now.getSeconds().toString().padStart(2, "0");
    let ampm = "";

    if (settings.clockFormat12h) {
      ampm = h >= 12 ? " PM" : " AM";
      h = h % 12 || 12;
    }
    const hStr = settings.clockFormat12h ? h.toString() : h.toString().padStart(2, "0");
    const timeStr = settings.showSeconds ? `${hStr}:${m}:${s}` : `${hStr}:${m}`;
    return { timeStr, ampm };
  }, [mounted, now, settings.clockFormat12h, settings.showSeconds]);

  const formattedDate = useMemo(() => {
    if (!mounted) return "";
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}`;
  }, [mounted, now]);

  const timerProgress = duration ? ((duration - remaining) / duration) * 100 : 0;
  const timerMinutes = Math.floor(remaining / 60).toString().padStart(2, "0");
  const timerSeconds = (remaining % 60).toString().padStart(2, "0");

  const fontClass = `font-${settings.fontChoice}`;

  return (
    <main
      className={`sky-viewport theme-${activeSkyTheme} ${fontClass} ${
        settings.vignette ? "with-vignette" : ""
      }`}
      style={
        {
          "--sun-progress": `${sunProgress}%`,
          "--cloud-cover": `${resolvedCloudCover}%`,
        } as React.CSSProperties
      }
    >
      {settings.ambientGlow && <div className="ambient-sky-glow" aria-hidden="true" />}

      <div
        className={`celestial-stars-layer ${
          activeSkyTheme === "night" || activeSkyTheme === "storm" || activeSkyTheme === "aurora"
            ? "visible"
            : ""
        }`}
        aria-hidden="true"
      >
        {activeStars.map((star, i) => (
          <div
            key={i}
            className="twinkle-star"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
        <div className="milkyway-dust" />
      </div>

      {settings.shootingStars && (activeSkyTheme === "night" || activeSkyTheme === "aurora") && (
        <div className="shooting-stars-field" aria-hidden="true">
          <div className="shooting-streak streak-1" />
          <div className="shooting-streak streak-2" />
          <div className="shooting-streak streak-3" />
        </div>
      )}

      {activeSkyTheme === "aurora" && (
        <div className="aurora-curtains" aria-hidden="true">
          <div className="aurora-wave aurora-1" />
          <div className="aurora-wave aurora-2" />
        </div>
      )}

      <div
        className={`clouds-sky-deck ${resolvedCloudCover > 65 ? "cloudy-dense" : ""} ${
          resolvedCloudCover > 85 ? "overcast-full" : ""
        }`}
        aria-hidden="true"
      >
        <div className="cloud-drift cloud-layer-back" />
        <div className="cloud-drift cloud-layer-mid" />
        <div className="cloud-drift cloud-layer-front" />
        {resolvedCloudCover > 70 && <div className="cloud-drift cloud-overcast-veil" />}
      </div>

      {isSmoggy && (
        <div className={`smog-haze-layer ${smogIntensityClass}`} aria-hidden="true">
          <div className="smog-particulate-drift" />
          <div className="smog-horizon-blanket" />
        </div>
      )}

      {showRain && (
        <div className="precipitation-canvas" aria-hidden="true">
          <div className="rain-sheet rain-near" />
          <div className="rain-sheet rain-far" />
        </div>
      )}

      {showLightning && (
        <div className="lightning-system" aria-hidden="true">
          <div className="sky-flash" />
          <div className="lightning-bolt bolt-left" />
          <div className="lightning-bolt bolt-right" />
        </div>
      )}

      <div className="celestial-system" aria-hidden="true">
        {activeSkyTheme === "night" || activeSkyTheme === "aurora" ? (
          <div className="lunar-orb-wrap">
            <RealisticMoon moon={moon} />
          </div>
        ) : (
          <div className="solar-orb-wrap">
            <div className="solar-corona" />
            <div className="solar-core" />
          </div>
        )}
      </div>

      <div className="horizon-radiance" aria-hidden="true" />

      {/* ── TOP BAR ── */}
      <header className="ambient-topbar">
        <div className="topbar-left">
          <button
            className="glass-pill location-badge"
            type="button"
            onClick={loadLocationAndWeather}
            title="Click to refresh location via IP"
          >
            <Icon name="map-pin" size={14} className="location-icon" />
            <span className="location-city">
              {location.city}
              {location.country ? `, ${location.country}` : ""}
            </span>
            {locationLoading && <Icon name="refresh-cw" size={12} className="spin-slow opacity-60" />}
          </button>

          {aqi !== null && (
            <div
              className={`glass-pill aqi-pill ${
                aqi > 150 ? "aqi-unhealthy" : aqi > 100 ? "aqi-moderate" : "aqi-good"
              }`}
              title={`US Air Quality Index: ${aqi} AQI (PM2.5: ${pm25 ?? "--"} µg/m³)`}
            >
              <Icon name="flame" size={13} />
              <span>
                {aqi > 150 ? `Smog ${aqi} AQI` : aqi > 100 ? `Hazy ${aqi} AQI` : `Air ${aqi} AQI`}
              </span>
            </div>
          )}
        </div>

        <div className="topbar-right">
          {tempC !== null && (
            <div className="glass-pill weather-badge">
              {showRain ? (
                <Icon name="cloud-rain" size={14} />
              ) : showLightning ? (
                <Icon name="cloud-lightning" size={14} />
              ) : resolvedCloudCover > 60 ? (
                <Icon name="cloud" size={14} />
              ) : activeSkyTheme === "night" ? (
                <Icon name="moon" size={14} />
              ) : (
                <Icon name="sun" size={14} />
              )}
              <span className="font-semibold">{tempC}°C</span>
              <span className="weather-desc-pill">{weatherDesc}</span>
            </div>
          )}

          <div className="glass-pill sky-phase-pill">
            <span className="pulse-dot" />
            <span>
              {activeSkyTheme === "night"
                ? `${moon.name} ${moon.emoji} (${moon.illumination}%)`
                : activeSkyTheme === "dawn"
                ? "Dawn Glow"
                : activeSkyTheme === "golden"
                ? "Golden Hour"
                : activeSkyTheme === "sunset"
                ? "Sunset Dusk"
                : activeSkyTheme === "storm"
                ? "Storm Sky"
                : activeSkyTheme === "aurora"
                ? "Northern Lights"
                : activeSkyTheme === "smog"
                ? "Smoggy Haze"
                : "Clear Daylight"}
            </span>
          </div>

          <button
            className="glass-pill icon-btn"
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Icon name="minimize" size={16} /> : <Icon name="maximize" size={16} />}
          </button>
        </div>
      </header>

      {/* ── CENTER CLOCK & FOCUS TIMER ── */}
      <section className={`center-focus-stage ${timerMode ? "in-timer" : ""}`}>
        {!timerMode ? (
          <div className="hero-clock-display">
            {settings.showClock && (
              <time className="hero-digits" dateTime={now.toISOString()} suppressHydrationWarning>
                {formattedTime.timeStr}
                {formattedTime.ampm && <span className="ampm-sub">{formattedTime.ampm}</span>}
              </time>
            )}

            {settings.showDate && (
              <p className="hero-date" suppressHydrationWarning>
                {formattedDate}
              </p>
            )}

            {settings.showWeatherInClock && tempC !== null && (
              <div className="hero-weather-meta" suppressHydrationWarning>
                <span>{tempC}°C</span>
                <span className="dot-divider">·</span>
                <span>{weatherDesc}</span>
                <span className="dot-divider">·</span>
                <span>Humidity {humidity}%</span>
                <span className="dot-divider">·</span>
                <span>Wind {windSpeed} km/h</span>
                {aqi !== null && (
                  <>
                    <span className="dot-divider">·</span>
                    <span>AQI {aqi}</span>
                  </>
                )}
              </div>
            )}

            <button
              className="glass-pill timer-launch-btn"
              type="button"
              onClick={() => setTimerMode(true)}
            >
              <Icon name="timer" size={16} />
              <span>Start Focus Timer</span>
            </button>
          </div>
        ) : (
          <div className="focus-timer-container">
            <div
              className="timer-radial-ring"
              style={{ "--timer-deg": `${timerProgress * 3.6}deg` } as React.CSSProperties}
            >
              <div className="timer-inner-glass">
                <span className="timer-badge">STILL · FOCUS</span>
                <time className="timer-clock-digits">
                  {timerMinutes}:{timerSeconds}
                </time>
              </div>
            </div>

            <div className="timer-presets-bar">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  className={`preset-pill ${duration === p.minutes * 60 ? "active" : ""}`}
                  type="button"
                  onClick={() => {
                    setDuration(p.minutes * 60);
                    setRemaining(p.minutes * 60);
                    setTimerRunning(true);
                  }}
                >
                  {p.label} <span className="preset-num">{p.minutes}m</span>
                </button>
              ))}
              <button
                className="preset-pill custom-btn"
                type="button"
                onClick={() => setCustomOpen((v) => !v)}
              >
                Custom +
              </button>
            </div>

            {customOpen && (
              <form
                className="custom-time-popover glass-panel"
                onSubmit={(e) => {
                  e.preventDefault();
                  const m = Number(customMinutes);
                  if (m > 0) {
                    setDuration(m * 60);
                    setRemaining(m * 60);
                    setTimerRunning(true);
                    setCustomOpen(false);
                  }
                }}
              >
                <label>Minutes:</label>
                <input
                  type="number"
                  min="1"
                  max="240"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                />
                <button type="submit">Set</button>
              </form>
            )}

            <div className="timer-controls-row">
              <button
                className="timer-circle-action"
                type="button"
                onClick={() => setTimerRunning((v) => !v)}
              >
                {timerRunning ? <Icon name="pause" size={22} /> : <Icon name="play" size={22} className="ml-1" />}
              </button>
              <button
                className="timer-exit-action"
                type="button"
                onClick={() => {
                  setTimerMode(false);
                  setTimerRunning(false);
                }}
              >
                Exit Timer
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ── BOTTOM RADIO DOCK ── */}
      <aside className={`ambient-radio-dock glass-panel ${radioDockOpen ? "dock-expanded" : ""}`}>
        <button
          className="radio-main-play"
          type="button"
          onClick={toggleRadio}
          aria-label={isPlaying ? "Pause Stream" : "Play Stream"}
        >
          {isPlaying ? <Icon name="pause" size={20} /> : <Icon name="play" size={20} className="ml-0.5" />}
        </button>

        <button
          className="radio-track-info"
          type="button"
          onClick={() => setRadioDockOpen((v) => !v)}
          title="Click to switch radio stations"
        >
          <span className="station-title">{activeStation.name}</span>
          <span className="station-genre">{isPlaying ? "Streaming Live" : activeStation.genre}</span>
        </button>

        <div className="radio-vol-strip">
          <button
            type="button"
            className="vol-icon-btn"
            onClick={() => updateSetting("volume", settings.volume === 0 ? 50 : 0)}
          >
            {settings.volume === 0 ? <Icon name="volume-x" size={17} /> : <Icon name="volume" size={17} />}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={settings.volume}
            onChange={(e) => updateSetting("volume", Number(e.target.value))}
            aria-label="Radio Volume"
            className="vol-slider"
          />
        </div>

        <button
          className="radio-toggle-expand"
          type="button"
          onClick={() => setRadioDockOpen((v) => !v)}
          aria-label="Radio Stations List"
        >
          <Icon name="radio" size={18} />
        </button>

        {radioDockOpen && (
          <div className="radio-station-selector">
            <p className="station-list-header">LOFI & AMBIENT BROADCASTS</p>
            <div className="station-grid">
              {RADIO_STATIONS.map((s) => (
                <button
                  key={s.id}
                  className={`station-item ${
                    settings.currentStationId === s.id && !settings.customRadioUrl ? "active" : ""
                  }`}
                  type="button"
                  onClick={() => {
                    updateSetting("currentStationId", s.id);
                    updateSetting("customRadioUrl", "");
                    setIsPlaying(true);
                  }}
                >
                  <span className="item-name">{s.name}</span>
                  <span className="item-genre">{s.genre}</span>
                </button>
              ))}
            </div>

            <div className="custom-stream-box">
              <label>Custom Stream URL</label>
              <input
                type="url"
                placeholder="https://..."
                value={settings.customRadioUrl}
                onChange={(e) => updateSetting("customRadioUrl", e.target.value)}
              />
            </div>
          </div>
        )}
      </aside>

      {/* ── SABITTWA & SETTINGS DRAWER (Pull-out Handle with > on Right Edge) ── */}
      <div className={`sabittwa-drawer-system ${settingsDrawerOpen ? "drawer-open" : ""}`}>
        <button
          className="drawer-edge-tab"
          type="button"
          onClick={() => setSettingsDrawerOpen((prev) => !prev)}
          aria-label={settingsDrawerOpen ? "Close drawer" : "Pull out Sabittwa & Settings drawer"}
          title={settingsDrawerOpen ? "Close Drawer" : "Pull out Settings & Sabittwa"}
        >
          <span className="drawer-tab-symbol">
            {settingsDrawerOpen ? <Icon name="chevron-right" size={18} /> : <Icon name="chevron-left" size={18} />}
          </span>
          <span className="drawer-tab-text">Sabittwa · Settings</span>
        </button>

        <aside className="sabittwa-side-panel glass-panel">
          <div className="drawer-profile-card">
            <div className="profile-badge-row">
              <div className="profile-avatar">S</div>
              <div className="profile-info">
                <h3 className="profile-name">Sabittwa</h3>
                <a
                  href="https://strangelytrue.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="profile-link"
                >
                  <span>strangelytrue.vercel.app</span>
                  <Icon name="external-link" size={12} />
                </a>
              </div>
            </div>
            <button
              className="drawer-close-cross"
              type="button"
              onClick={() => setSettingsDrawerOpen(false)}
              aria-label="Close settings drawer"
            >
              <Icon name="chevron-right" size={18} />
            </button>
          </div>

          <div className="drawer-tab-bar">
            <button
              className={`tab-btn ${activeTab === "sky" ? "active" : ""}`}
              onClick={() => setActiveTab("sky")}
              type="button"
            >
              Sky & FX
            </button>
            <button
              className={`tab-btn ${activeTab === "clock" ? "active" : ""}`}
              onClick={() => setActiveTab("clock")}
              type="button"
            >
              Clock
            </button>
            <button
              className={`tab-btn ${activeTab === "audio" ? "active" : ""}`}
              onClick={() => setActiveTab("audio")}
              type="button"
            >
              Audio
            </button>
            <button
              className={`tab-btn ${activeTab === "json" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("json");
                setJsonInput(JSON.stringify(settings, null, 2));
              }}
              type="button"
            >
              JSON
            </button>
          </div>

          <div className="drawer-scrollable-body">
            {activeTab === "sky" && (
              <div className="settings-section-group">
                <div className="setting-block">
                  <label className="setting-label">Sky Theme Override</label>
                  <p className="setting-hint">Choose a time or let live sun and moon dictate.</p>
                  <div className="radio-options-grid">
                    {[
                      { id: "auto", label: "Auto (Live Real-Time)" },
                      { id: "dawn", label: "Dawn Glow" },
                      { id: "day", label: "Clear Day" },
                      { id: "golden", label: "Golden Hour" },
                      { id: "sunset", label: "Sunset Dusk" },
                      { id: "night", label: "Starry Night" },
                      { id: "storm", label: "Thunderstorm" },
                      { id: "aurora", label: "Aurora Borealis" },
                      { id: "smog", label: "Smog & Dust Haze" },
                      { id: "overcast", label: "Overcast Mist" },
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        className={`chip-choice ${
                          settings.skyTheme === theme.id ? "selected" : ""
                        }`}
                        onClick={() => updateSetting("skyTheme", theme.id as SkyTheme)}
                      >
                        {theme.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="setting-block">
                  <label className="setting-label">Cloud Density</label>
                  <div className="chip-row">
                    {[
                      { id: "auto", label: "Auto (IP Weather)" },
                      { id: "clear", label: "Clear" },
                      { id: "scattered", label: "Scattered" },
                      { id: "heavy", label: "Heavy" },
                      { id: "overcast", label: "Overcast" },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className={`chip-choice ${
                          settings.cloudDensity === c.id ? "selected" : ""
                        }`}
                        onClick={() =>
                          updateSetting("cloudDensity", c.id as AppSettings["cloudDensity"])
                        }
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="setting-block">
                  <label className="setting-label">Smog / Air Pollution Layer</label>
                  <p className="setting-hint">
                    Accounts for high particulate matter (PM2.5) & smog haze.
                  </p>
                  <div className="chip-row">
                    {[
                      { id: "auto", label: "Auto (Live AQI)" },
                      { id: "clean", label: "Off (Clean)" },
                      { id: "moderate", label: "Moderate Smog" },
                      { id: "heavy", label: "Heavy Smog" },
                    ].map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        className={`chip-choice ${settings.smogLevel === s.id ? "selected" : ""}`}
                        onClick={() => updateSetting("smogLevel", s.id as AppSettings["smogLevel"])}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="setting-block">
                  <label className="setting-label">Precipitation & Lightning</label>
                  <div className="chip-row">
                    {[
                      { id: "auto", label: "Auto (Live Forecast)" },
                      { id: "none", label: "None" },
                      { id: "rain", label: "Rain" },
                      { id: "storm", label: "Lightning Storm" },
                    ].map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        className={`chip-choice ${
                          settings.weatherEffect === w.id ? "selected" : ""
                        }`}
                        onClick={() =>
                          updateSetting("weatherEffect", w.id as AppSettings["weatherEffect"])
                        }
                      >
                        {w.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="setting-block">
                  <label className="setting-label">Night Sky Details</label>
                  <div className="toggle-list">
                    <label className="toggle-item">
                      <span>Shooting Stars</span>
                      <input
                        type="checkbox"
                        checked={settings.shootingStars}
                        onChange={(e) => updateSetting("shootingStars", e.target.checked)}
                      />
                    </label>
                    <label className="toggle-item">
                      <span>Ambient Horizon Glow</span>
                      <input
                        type="checkbox"
                        checked={settings.ambientGlow}
                        onChange={(e) => updateSetting("ambientGlow", e.target.checked)}
                      />
                    </label>
                    <label className="toggle-item">
                      <span>Cinematic Vignette</span>
                      <input
                        type="checkbox"
                        checked={settings.vignette}
                        onChange={(e) => updateSetting("vignette", e.target.checked)}
                      />
                    </label>
                  </div>
                </div>

                <div className="setting-block">
                  <label className="setting-label">Star Density</label>
                  <div className="chip-row">
                    {(["low", "medium", "high"] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        className={`chip-choice ${settings.starDensity === lvl ? "selected" : ""}`}
                        onClick={() => updateSetting("starDensity", lvl)}
                      >
                        {lvl.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "clock" && (
              <div className="settings-section-group">
                <div className="setting-block">
                  <label className="setting-label">Display Font</label>
                  <div className="chip-row wrap-chips">
                    {[
                      { id: "cormorant", name: "Cormorant (Ethereal Serif)" },
                      { id: "inter", name: "Inter (Modern Sans)" },
                      { id: "playfair", name: "Playfair (Editorial)" },
                      { id: "mono", name: "JetBrains (Monospace)" },
                      { id: "space", name: "Space Grotesk (Tech)" },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        className={`chip-choice font-preview-chip font-${f.id} ${
                          settings.fontChoice === f.id ? "selected" : ""
                        }`}
                        onClick={() => updateSetting("fontChoice", f.id as FontChoice)}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="setting-block">
                  <label className="setting-label">Clock Display Options</label>
                  <div className="toggle-list">
                    <label className="toggle-item">
                      <span>Show Clock</span>
                      <input
                        type="checkbox"
                        checked={settings.showClock}
                        onChange={(e) => updateSetting("showClock", e.target.checked)}
                      />
                    </label>
                    <label className="toggle-item">
                      <span>12-Hour Format (AM/PM)</span>
                      <input
                        type="checkbox"
                        checked={settings.clockFormat12h}
                        onChange={(e) => updateSetting("clockFormat12h", e.target.checked)}
                      />
                    </label>
                    <label className="toggle-item">
                      <span>Show Seconds</span>
                      <input
                        type="checkbox"
                        checked={settings.showSeconds}
                        onChange={(e) => updateSetting("showSeconds", e.target.checked)}
                      />
                    </label>
                    <label className="toggle-item">
                      <span>Show Date</span>
                      <input
                        type="checkbox"
                        checked={settings.showDate}
                        onChange={(e) => updateSetting("showDate", e.target.checked)}
                      />
                    </label>
                    <label className="toggle-item">
                      <span>Show Weather under Clock</span>
                      <input
                        type="checkbox"
                        checked={settings.showWeatherInClock}
                        onChange={(e) => updateSetting("showWeatherInClock", e.target.checked)}
                      />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "audio" && (
              <div className="settings-section-group">
                <div className="setting-block">
                  <label className="setting-label">Ambient Soundscape Layer</label>
                  <p className="setting-hint">
                    Procedurally synthesized in-browser relaxation background.
                  </p>
                  <div className="chip-row">
                    {[
                      { id: "none", label: "Off" },
                      { id: "rain", label: "Gentle Rain" },
                      { id: "whitenoise", label: "Pink Noise" },
                      { id: "fire", label: "Campfire" },
                    ].map((amb) => (
                      <button
                        key={amb.id}
                        type="button"
                        className={`chip-choice ${
                          settings.ambientSound === amb.id ? "selected" : ""
                        }`}
                        onClick={() =>
                          updateSetting("ambientSound", amb.id as AppSettings["ambientSound"])
                        }
                      >
                        {amb.label}
                      </button>
                    ))}
                  </div>

                  {settings.ambientSound !== "none" && (
                    <div className="mt-3">
                      <label className="sub-label">Ambient Volume ({settings.ambientVolume}%)</label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={settings.ambientVolume}
                        onChange={(e) => updateSetting("ambientVolume", Number(e.target.value))}
                        className="vol-slider"
                      />
                    </div>
                  )}
                </div>

                <div className="setting-block">
                  <label className="setting-label">Radio Stream Preset</label>
                  <div className="station-select-column">
                    {RADIO_STATIONS.map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        className={`station-select-row ${
                          settings.currentStationId === st.id && !settings.customRadioUrl
                            ? "selected"
                            : ""
                        }`}
                        onClick={() => {
                          updateSetting("currentStationId", st.id);
                          updateSetting("customRadioUrl", "");
                        }}
                      >
                        <div>
                          <p className="st-name">{st.name}</p>
                          <p className="st-desc">{st.genre}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "json" && (
              <div className="settings-section-group">
                <div className="setting-block">
                  <div className="flex-between">
                    <label className="setting-label">Browser JSON Configuration</label>
                    <button
                      type="button"
                      className="glass-pill icon-text-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(settings, null, 2));
                        setCopiedJson(true);
                        setTimeout(() => setCopiedJson(false), 2000);
                      }}
                    >
                      {copiedJson ? <Icon name="check" size={13} /> : <Icon name="copy" size={13} />}
                      <span>{copiedJson ? "Copied" : "Copy JSON"}</span>
                    </button>
                  </div>
                  <p className="setting-hint">
                    This JSON is saved in your browser&apos;s localStorage (still_lofi_settings_v2).
                  </p>
                  <textarea
                    rows={12}
                    className="json-textarea"
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                  />
                  <div className="json-action-row">
                    <button
                      type="button"
                      className="glass-pill save-json-btn"
                      onClick={() => {
                        try {
                          const parsed = JSON.parse(jsonInput);
                          setSettings(parsed);
                          localStorage.setItem("still_lofi_settings_v2", JSON.stringify(parsed));
                          alert("Settings updated from JSON!");
                        } catch {
                          alert("Invalid JSON syntax.");
                        }
                      }}
                    >
                      Apply JSON
                    </button>
                    <button
                      type="button"
                      className="glass-pill reset-btn"
                      onClick={() => {
                        if (confirm("Reset all settings to default?")) {
                          resetSettings();
                          setJsonInput(JSON.stringify(DEFAULT_SETTINGS, null, 2));
                        }
                      }}
                    >
                      <Icon name="rotate-ccw" size={14} />
                      <span>Reset to Defaults</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      {activeStation.url ? (
        <audio
          ref={audioRef}
          src={activeStation.url}
          preload="none"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      ) : (
        <audio ref={audioRef} preload="none" />
      )}
    </main>
  );
}
