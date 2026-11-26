export type SkyPhase =
  | "night"
  | "twilight"
  | "dawn"
  | "morning"
  | "day"
  | "afternoon"
  | "golden"
  | "dusk";

export interface WeatherInfo {
  temperature: number;
  description: string;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
  aqi: number | null;
  pm25: number | null;
}

export interface RadioMeta {
  title: string;
  station: string;
}

export interface MoonData {
  phase: number;
  fraction: number;
  brightLimbAngleDeg?: number;
  name: string;
  emoji: string;
}

export interface CelestialBodyPos {
  x: number; // % from left (East = right, West = left)
  y: number; // % from top (North = up)
  altitudeDeg: number;
  visible: boolean;
}
