import type { MoonData } from "./types";

/* ── time / date (hydration-safe, no Intl) ── */
export function formatTime(date: Date) {
  return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
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

/* ── moon phase (simplified Julian-day method) ── */
export function getMoonPhase(date: Date): MoonData {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  let c: number, e: number;
  if (month < 3) { c = year - 1; e = month + 12; } else { c = year; e = month; }

  let jd = Math.floor(365.25 * (c + 4716)) + Math.floor(30.6001 * (e + 1)) + day - 1524.5;
  const b = Math.floor(jd / 36524.25);
  jd = jd + 1 + b - Math.floor(b / 4);

  const daysSinceNew = (jd - 2451550.1) % 29.530588853;
  const phase = ((daysSinceNew + 29.530588853) % 29.530588853) / 29.530588853;

  const TABLE: [number, string, string][] = [
    [0.0625, "New Moon", "🌑"], [0.1875, "Waxing Crescent", "🌒"],
    [0.3125, "First Quarter", "🌓"], [0.4375, "Waxing Gibbous", "🌔"],
    [0.5625, "Full Moon", "🌕"], [0.6875, "Waning Gibbous", "🌖"],
    [0.8125, "Last Quarter", "🌗"], [0.9375, "Waning Crescent", "🌘"],
  ];
  for (const [limit, name, emoji] of TABLE) {
    if (phase < limit) return { phase, name, emoji };
  }
  return { phase, name: "New Moon", emoji: "🌑" };
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
