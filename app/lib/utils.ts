import * as SunCalc from "suncalc";
import type { CelestialBodyPos, MoonData, SkyPhase } from "./types";

/* ── time / date (hydration-safe, no Intl) ── */
export function formatTime(date: Date, use12h = false) {
  const rawH = date.getHours();
  const m = date.getMinutes().toString().padStart(2, "0");
  if (use12h) {
    const h = rawH % 12 || 12;
    const period = rawH >= 12 ? "PM" : "AM";
    return `${h}:${m} ${period}`;
  }
  return `${rawH.toString().padStart(2, "0")}:${m}`;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function formatDateLabel(date: Date) {
  return `${DAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

export function formatTimer(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

/* ── real astronomical moon phase via SunCalc ── */
export function getMoonPhase(date: Date): MoonData {
  const illum = SunCalc.getMoonIllumination(date);
  const phase = illum.phase;

  const TABLE: [number, string, string][] = [
    [0.0625, "New Moon", "🌑"], [0.1875, "Waxing Crescent", "🌒"],
    [0.3125, "First Quarter", "🌓"], [0.4375, "Waxing Gibbous", "🌔"],
    [0.5625, "Full Moon", "🌕"], [0.6875, "Waning Gibbous", "🌖"],
    [0.8125, "Last Quarter", "🌗"], [0.9375, "Waning Crescent", "🌘"],
  ];
  for (const [limit, name, emoji] of TABLE) {
    if (phase < limit) return { phase, fraction: illum.fraction, name, emoji };
  }
  return { phase, fraction: illum.fraction, name: "New Moon", emoji: "🌑" };
}

/**
 * Map SunCalc (azimuth, altitude) to screen coordinates where:
 * Right = East (-π/2), Left = West (+π/2), Up = North (±π), Down = South (0).
 */
function mapAzAltToScreen(azimuth: number, altitude: number): CelestialBodyPos {
  const altitudeDeg = (altitude * 180) / Math.PI;
  const visible = altitudeDeg > -2;
  // East (azimuth = -π/2) -> sin = -1 -> x = 88% (right)
  // West (azimuth = +π/2) -> sin = +1 -> x = 12% (left)
  const x = Math.max(6, Math.min(94, 50 - 38 * Math.sin(azimuth)));
  const altNorm = Math.max(0, Math.min(1, altitude / (Math.PI / 2)));
  // Up = North (-cos(π) = +1 -> higher), South (-cos(0) = -1 -> lower)
  const northBias = -Math.cos(azimuth) * 10 * (1 - altNorm * 0.5);
  const y = Math.max(8, Math.min(92, 78 - altNorm * 56 - northBias));
  return { x, y, altitudeDeg, visible };
}

export function getCelestialState(date: Date, lat: number | null, lon: number | null): {
  phase: SkyPhase;
  sun: CelestialBodyPos;
  moon: CelestialBodyPos;
} {
  if (lat == null || lon == null) {
    const h = date.getHours() + date.getMinutes() / 60;
    let phase: SkyPhase = "day";
    if (h >= 4.5 && h < 5.5) phase = "twilight";
    else if (h >= 5.5 && h < 7) phase = "dawn";
    else if (h >= 7 && h < 10) phase = "morning";
    else if (h >= 10 && h < 15.5) phase = "day";
    else if (h >= 15.5 && h < 17.5) phase = "afternoon";
    else if (h >= 17.5 && h < 19.2) phase = "golden";
    else if (h >= 19.2 && h < 20.5) phase = "dusk";
    else phase = "night";

    // Fallback arc: East (88%) at 6am -> West (12%) at 6pm
    const dayProg = Math.max(0, Math.min(1, (h - 6) / 12));
    const sunX = 88 - dayProg * 76;
    const sunY = 76 - Math.sin(dayProg * Math.PI) * 52;
    const sunVisible = h >= 5.5 && h <= 19;
    const moonVisible = h < 6 || h >= 19;
    return {
      phase,
      sun: { x: sunX, y: sunY, altitudeDeg: sunVisible ? 20 : -15, visible: sunVisible },
      moon: { x: 74, y: 24, altitudeDeg: moonVisible ? 35 : -15, visible: moonVisible },
    };
  }

  const sunPos = SunCalc.getPosition(date, lat, lon);
  const nextSunPos = SunCalc.getPosition(new Date(date.getTime() + 600_000), lat, lon);
  const isRising = nextSunPos.altitude > sunPos.altitude;
  const sunAltDeg = (sunPos.altitude * 180) / Math.PI;

  let phase: SkyPhase;
  if (sunAltDeg < -12) phase = "night";
  else if (sunAltDeg < -4) phase = isRising ? "twilight" : "dusk";
  else if (sunAltDeg < 5) phase = isRising ? "dawn" : "golden";
  else if (sunAltDeg < 18) phase = isRising ? "morning" : "afternoon";
  else phase = "day";

  const moonPos = SunCalc.getMoonPosition(date, lat, lon);

  return {
    phase,
    sun: mapAzAltToScreen(sunPos.azimuth, sunPos.altitude),
    moon: mapAzAltToScreen(moonPos.azimuth, moonPos.altitude),
  };
}

/* ── star field generation (deterministic RNG) ── */
export interface Star { x: number; y: number; size: number; opacity: number; delay: number; }

export function generateStars(count: number, seed = 42): Star[] {
  const stars: Star[] = [];
  let s = seed;
  const rng = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < count; i++) {
    stars.push({ x: rng() * 100, y: rng() * 70, size: 0.5 + rng() * 2, opacity: 0.3 + rng() * 0.7, delay: rng() * 8 });
  }
  return stars;
}
