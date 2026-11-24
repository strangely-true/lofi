"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { SkyPhase, WeatherInfo, RadioMeta } from "./lib/types";
import { formatTime, formatDateLabel, getMoonPhase, generateStars } from "./lib/utils";
import { DEFAULT_RADIO_URL } from "./lib/constants";
import { SKY_GRADIENTS } from "./lib/sky";
import { fetchLocationByIP, browserGeolocation, reverseGeocode, fetchWeatherAndSolar } from "./lib/data";

import { StarField, ShootingStars } from "./components/star-field";
import { Celestial } from "./components/celestial";
import { Clouds } from "./components/clouds";
import { TopBar } from "./components/top-bar";
import { ClockDisplay } from "./components/clock-display";
import { FocusTimer } from "./components/focus-timer";
import { RadioDock } from "./components/radio-dock";
import { SideDrawer } from "./components/side-drawer";

/* ── pre-compute star positions (deterministic, no hydration issue) ── */
const STARS = generateStars(120);
const DIM_STARS = generateStars(40, 99);

/* ═══════════════════════════════════════════
   HOME — single client boundary, state hub
   ═══════════════════════════════════════════ */
export default function Home() {
  /* ── state ── */
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(() => new Date(0));

  // sky
  const [solarProgress, setSolarProgress] = useState<number | null>(null);
  const [solarPhase, setSolarPhase] = useState<SkyPhase | null>(null);
  const [locationName, setLocationName] = useState("Locating…");
  const [cloudCover, setCloudCover] = useState(20);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);

  // timer
  const [timerMode, setTimerMode] = useState(false);
  const [duration, setDuration] = useState(25 * 60);
  const [remaining, setRemaining] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("30");

  // radio
  const [radioOpen, setRadioOpen] = useState(false);
  const [radioUrl, setRadioUrl] = useState(DEFAULT_RADIO_URL);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(55);
  const [radioMeta, setRadioMeta] = useState<RadioMeta>({ title: "Box Radio Lofi", station: "boxradio.co" });
  const audioRef = useRef<HTMLAudioElement>(null);

  // ui
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* ───────── effects ───────── */

  // clock
  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // location → weather → solar (IP first, browser fallback)
  useEffect(() => {
    let dead = false;
    (async () => {
      let lat: number | null = null, lon: number | null = null;

      const ip = await fetchLocationByIP();
      if (!dead && ip) {
        lat = ip.lat; lon = ip.lon;
        setLocationName(ip.country ? `${ip.city}, ${ip.country}` : ip.city);
      }

      const geo = await browserGeolocation();
      if (!dead && geo) {
        lat = geo.lat; lon = geo.lon;
        const name = await reverseGeocode(geo.lat, geo.lon);
        if (!dead) setLocationName(name);
      }

      if (!dead && lat == null) { setLocationName("Local sky"); return; }
      if (lat == null || lon == null) return;

      const result = await fetchWeatherAndSolar(lat, lon);
      if (!dead && result) {
        setWeather(result.weather);
        setCloudCover(result.cloudCover);
        if (result.solarPhase) setSolarPhase(result.solarPhase);
        if (result.solarProgress != null) setSolarProgress(result.solarProgress);
      }
    })();
    return () => { dead = true; };
  }, []);

  // radio metadata polling
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    function check() {
      if ("mediaSession" in navigator && navigator.mediaSession.metadata) {
        const m = navigator.mediaSession.metadata;
        if (m.title || m.artist) setRadioMeta({ title: m.title || "Lofi Radio", station: m.artist || "boxradio.co" });
      }
    }
    let iv: ReturnType<typeof setInterval> | null = null;
    const onPlay = () => { check(); iv = setInterval(check, 5000); };
    const onPause = () => { if (iv) clearInterval(iv); };
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    return () => { audio.removeEventListener("play", onPlay); audio.removeEventListener("pause", onPause); if (iv) clearInterval(iv); };
  }, [mounted]);

  // timer tick
  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => {
      setRemaining((v) => { if (v <= 1) { clearInterval(id); setTimerRunning(false); return 0; } return v - 1; });
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning]);

  // volume sync
  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume / 100; }, [volume]);

  // fullscreen
  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  /* ───────── handlers ───────── */
  const toggleRadio = useCallback(async () => {
    const a = audioRef.current; if (!a) return;
    if (isPlaying) { a.pause(); setIsPlaying(false); return; }
    try { await a.play(); setIsPlaying(true); } catch { setIsPlaying(false); }
  }, [isPlaying]);

  const startPreset = useCallback((min: number) => {
    setDuration(min * 60); setRemaining(min * 60); setTimerRunning(true); setTimerMode(true); setCustomOpen(false);
  }, []);

  const toggleTimerRunning = useCallback(() => {
    if (remaining === 0) { setRemaining(duration); setTimerRunning(true); } else setTimerRunning((v) => !v);
  }, [remaining, duration]);

  const closeTimer = useCallback(() => { setTimerMode(false); setTimerRunning(false); }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    else document.exitFullscreen().catch(() => {});
  }, []);

  /* ───────── computed ───────── */
  const h = now.getHours() + now.getMinutes() / 60;
  let localPhase: SkyPhase = "day";
  if (h >= 5 && h < 7) localPhase = "dawn";
  else if (h >= 17 && h < 20) localPhase = "golden";
  else if (h >= 20 || h < 5) localPhase = "night";

  const phase = solarPhase ?? localPhase;
  const sunProg = solarProgress ?? Math.max(0, Math.min(100, ((h - 6) / 14) * 100));
  const moonData = getMoonPhase(now);
  const timeLabel = mounted ? formatTime(now) : "--:--";
  const dateLabel = mounted ? formatDateLabel(now) : "";

  /* ───────── render ───────── */
  return (
    <main
      className="relative w-screen h-dvh overflow-hidden isolate transition-[background] duration-[2000ms] ease-in-out"
      style={{ ...SKY_GRADIENTS[phase], "--sun-progress": `${sunProg}%` } as React.CSSProperties}
    >
      {/* Background layers */}
      <StarField phase={phase} stars={STARS} dimStars={DIM_STARS} />
      <ShootingStars phase={phase} />
      <Clouds cloudCover={cloudCover} phase={phase} />
      <Celestial phase={phase} sunProgress={sunProg} moonData={moonData} />

      {/* UI */}
      <TopBar
        locationName={locationName}
        weather={weather}
        phase={phase}
        moonData={moonData}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      <section className="absolute z-[3] inset-[74px_24px_118px] grid place-items-center transition-all duration-600 ease-[cubic-bezier(0.2,0.8,0.2,1)] max-md:inset-[70px_12px_104px]">
        {!timerMode ? (
          <ClockDisplay timeLabel={timeLabel} dateLabel={dateLabel} weather={weather} now={now} phase={phase} onStartTimer={() => setTimerMode(true)} />
        ) : (
          <FocusTimer
            duration={duration} remaining={remaining} timerRunning={timerRunning}
            customOpen={customOpen} customMinutes={customMinutes} phase={phase}
            onStartPreset={startPreset} onToggleRunning={toggleTimerRunning} onClose={closeTimer}
            onSetCustomOpen={setCustomOpen} onSetCustomMinutes={setCustomMinutes}
          />
        )}
      </section>

      <RadioDock
        isPlaying={isPlaying} radioMeta={radioMeta} volume={volume} radioUrl={radioUrl} radioOpen={radioOpen} phase={phase}
        onToggleRadio={toggleRadio} onSetVolume={setVolume} onSetRadioUrl={setRadioUrl} onToggleRadioOpen={() => setRadioOpen((v) => !v)}
      />

      <SideDrawer
        open={drawerOpen} volume={volume} radioUrl={radioUrl} isFullscreen={isFullscreen} phase={phase}
        onToggle={() => setDrawerOpen((v) => !v)} onSetVolume={setVolume} onSetRadioUrl={setRadioUrl} onToggleFullscreen={toggleFullscreen}
      />

      {/* Audio element */}
      {radioUrl ? <audio ref={audioRef} src={radioUrl} preload="none" crossOrigin="anonymous" /> : <audio ref={audioRef} preload="none" />}
    </main>
  );
}
