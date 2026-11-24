export type SkyPhase = "dawn" | "day" | "golden" | "night";

export interface WeatherInfo {
  temperature: number;
  description: string;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
}

export interface RadioMeta {
  title: string;
  station: string;
}

export interface MoonData {
  phase: number;
  name: string;
  emoji: string;
}
