import type { WeatherInfo, SkyPhase } from "./types";
import { WMO } from "./constants";

/* ───── IP-based geolocation (no permission prompt) ───── */
export async function fetchLocationByIP(): Promise<{ lat: number; lon: number; city: string; country: string } | null> {
  try {
    const r = await fetch("http://ip-api.com/json/?fields=status,city,country,lat,lon");
    if (r.ok) { const d = await r.json(); if (d.status === "success") return { lat: d.lat, lon: d.lon, city: d.city, country: d.country }; }
  } catch { /* next */ }
  try {
    const r = await fetch("https://ipapi.co/json/");
    if (r.ok) { const d = await r.json(); if (d.city) return { lat: d.latitude, lon: d.longitude, city: d.city, country: d.country_name }; }
  } catch { /* next */ }
  return null;
}

/* ───── Browser geolocation (may prompt) ───── */
export function browserGeolocation(): Promise<{ lat: number; lon: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => resolve(null),
      { maximumAge: 600000, timeout: 8000 },
    );
  });
}

/* ───── Reverse geocode ───── */
export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10&accept-language=en`);
    if (r.ok) {
      const d = await r.json();
      const city = d.address?.city || d.address?.town || d.address?.village || d.address?.county || d.address?.state;
      if (city) return d.address?.country ? `${city}, ${d.address.country}` : city;
    }
  } catch { /* next */ }
  return Intl.DateTimeFormat().resolvedOptions().timeZone.split("/").pop()?.replaceAll("_", " ") || "Local sky";
}

/* ───── Weather + solar data ───── */
export async function fetchWeatherAndSolar(lat: number, lon: number): Promise<{
  weather: WeatherInfo;
  cloudCover: number;
  solarPhase: SkyPhase | null;
  solarProgress: number | null;
} | null> {
  try {
    const r = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=sunrise,sunset&current=temperature_2m,weather_code,cloud_cover,wind_speed_10m,relative_humidity_2m&timezone=auto&forecast_days=1`,
    );
    if (!r.ok) return null;
    const d = await r.json();

    const code = d.current?.weather_code ?? 0;
    const weather: WeatherInfo = {
      temperature: Math.round(d.current?.temperature_2m ?? 0),
      description: WMO[code] ?? "Unknown",
      weatherCode: code,
      windSpeed: Math.round(d.current?.wind_speed_10m ?? 0),
      humidity: Math.round(d.current?.relative_humidity_2m ?? 0),
    };

    let solarPhase: SkyPhase | null = null;
    let solarProgress: number | null = null;
    const sunrise = d.daily?.sunrise?.[0];
    const sunset = d.daily?.sunset?.[0];
    if (sunrise && sunset) {
      const riseMin = new Date(sunrise).getHours() * 60 + new Date(sunrise).getMinutes();
      const setMin = new Date(sunset).getHours() * 60 + new Date(sunset).getMinutes();
      const curMin = new Date().getHours() * 60 + new Date().getMinutes();
      solarProgress = Math.max(0, Math.min(100, ((curMin - riseMin) / (setMin - riseMin)) * 100));
      if (curMin >= riseMin - 45 && curMin < riseMin + 75) solarPhase = "dawn";
      else if (curMin >= setMin - 90 && curMin < setMin + 30) solarPhase = "golden";
      else if (curMin >= setMin + 30 || curMin < riseMin - 45) solarPhase = "night";
      else solarPhase = "day";
    }

    return { weather, cloudCover: d.current?.cloud_cover ?? 20, solarPhase, solarProgress };
  } catch {
    return null;
  }
}
