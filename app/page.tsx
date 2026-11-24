"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { SkyPhase, WeatherInfo, RadioMeta } from "./lib/types";
import { formatTime, formatTimer, formatDateLabel, getMoonPhase, generateStars } from "./lib/utils";
import { DEFAULT_RADIO_URL } from "./lib/constants";
import { SKY_GRADIENTS } from "./lib/sky";
import { fetchLocationByIP, browserGeolocation, reverseGeocode, fetchWeatherAndSolar } from "./lib/data";
import { playTimerChime, setAmbientLevel } from "./lib/ambient-audio";

import { StarField, ShootingStars } from "./components/star-field";
import { Celestial } from "./components/celestial";
import { Clouds } from "./components/clouds";
import { WeatherParticles } from "./components/weather-particles";
import { Character } from "./components/character";
import { TopBar } from "./components/top-bar";
import { ClockDisplay } from "./components/clock-display";
import { FocusTimer } from "./components/focus-timer";
import { RadioDock } from "./components/radio-dock";
import { SideDrawer } from "./components/side-drawer";

/* ── pre-compute star positions (deterministic, no hydration issue) ── */
const STARS = generateStars(120);
const DIM_STARS = generateStars(40, 99);
const PREFS_KEY = "still-prefs-v1";

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
  const [skyOverride, setSkyOverride] = useState<"auto" | SkyPhase>("auto");
  const [locationName, setLocationName] = useState("Locating…");
  const [cloudCover, setCloudCover] = useState(20);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);

  // timer
  const [timerMode, setTimerMode] = useState(false);
  const [focusPhase, setFocusPhase] = useState<"focus" | "break">("focus");
  const [duration, setDuration] = useState(25 * 60);
  const [remaining, setRemaining] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [customOpen, setCustomOpen] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("30");

  // radio
  const [radioUrl, setRadioUrl] = useState(DEFAULT_RADIO_URL);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioStatus, setAudioStatus] = useState<"idle" | "loading" | "playing" | "error">("idle");
  const [volume, setVolume] = useState(55);
  const [radioMeta, setRadioMeta] = useState<RadioMeta>({ title: "Lofi Radio", station: "Live Stream" });
  const audioRef = useRef<HTMLAudioElement>(null);

  // ambient mixer
  const [rainLevel, setRainLevel] = useState(0);
  const [windLevel, setWindLevel] = useState(0);
  const [fireLevel, setFireLevel] = useState(0);

  // ui & prefs
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [use12h, setUse12h] = useState(false);
  const [zenAutoHide, setZenAutoHide] = useState(false);
  const [zenDimmed, setZenDimmed] = useState(false);

  /* ───────── effects ───────── */

  // load persisted prefs
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (typeof p.volume === "number") setVolume(p.volume);
        if (typeof p.radioUrl === "string" && p.radioUrl) setRadioUrl(p.radioUrl);
        if (typeof p.use12h === "boolean") setUse12h(p.use12h);
        if (typeof p.zenAutoHide === "boolean") setZenAutoHide(p.zenAutoHide);
        if (p.skyOverride) setSkyOverride(p.skyOverride);
        if (typeof p.rainLevel === "number") setRainLevel(p.rainLevel);
        if (typeof p.windLevel === "number") setWindLevel(p.windLevel);
        if (typeof p.fireLevel === "number") setFireLevel(p.fireLevel);
      }
    } catch { /* ignore */ }
  }, []);

  // save persisted prefs
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(
        PREFS_KEY,
        JSON.stringify({ volume, radioUrl, use12h, zenAutoHide, skyOverride, rainLevel, windLevel, fireLevel })
      );
    } catch { /* ignore */ }
  }, [mounted, volume, radioUrl, use12h, zenAutoHide, skyOverride, rainLevel, windLevel, fireLevel]);

  // sync ambient channels
  useEffect(() => { setAmbientLevel("rain", rainLevel); }, [rainLevel]);
  useEffect(() => { setAmbientLevel("wind", windLevel); }, [windLevel]);
  useEffect(() => { setAmbientLevel("fire", fireLevel); }, [fireLevel]);

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

  // radio metadata & buffering/error listeners
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    function check() {
      if ("mediaSession" in navigator && navigator.mediaSession.metadata) {
        const m = navigator.mediaSession.metadata;
        if (m.title || m.artist) setRadioMeta({ title: m.title || "Lofi Radio", station: m.artist || "Live Stream" });
      }
    }
    let iv: ReturnType<typeof setInterval> | null = null;
    const onWaiting = () => setAudioStatus("loading");
    const onPlaying = () => { setAudioStatus("playing"); setIsPlaying(true); check(); if (!iv) iv = setInterval(check, 5000); };
    const onPause = () => { setAudioStatus("idle"); setIsPlaying(false); if (iv) { clearInterval(iv); iv = null; } };
    const onError = () => { setAudioStatus("error"); setIsPlaying(false); if (iv) { clearInterval(iv); iv = null; } };
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("error", onError);
      if (iv) clearInterval(iv);
    };
  }, [mounted]);

  // timer tick + chime + break auto-switch
  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => {
      setRemaining((v) => {
        if (v <= 1) {
          clearInterval(id);
          setTimerRunning(false);
          playTimerChime();
          setFocusPhase((prev) => {
            if (prev === "focus") {
              setSessionsCompleted((c) => c + 1);
              setDuration(5 * 60);
              setRemaining(5 * 60);
              return "break";
            }
            setDuration(25 * 60);
            setRemaining(25 * 60);
            return "focus";
          });
          return 0;
        }
        return v - 1;
      });
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

  // dynamic document title: timer when active, weather when inactive
  useEffect(() => {
    if (timerMode) {
      const label = !timerRunning ? "Paused" : focusPhase === "break" ? "Break" : "Focus";
      document.title = `${formatTimer(remaining)} · ${label} — Still`;
    } else if (weather) {
      document.title = `${weather.temperature}°C ${weather.description} — Still`;
    } else {
      document.title = "Still — Lofi Focus";
    }
  }, [timerMode, remaining, timerRunning, focusPhase, weather]);

  // idle zen auto-hide
  useEffect(() => {
    if (!zenAutoHide || drawerOpen) {
      setZenDimmed(false);
      return;
    }
    let timeout = setTimeout(() => setZenDimmed(true), 10000);
    const reset = () => {
      setZenDimmed(false);
      clearTimeout(timeout);
      timeout = setTimeout(() => setZenDimmed(true), 10000);
    };
    window.addEventListener("pointermove", reset);
    window.addEventListener("keydown", reset);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("pointermove", reset);
      window.removeEventListener("keydown", reset);
    };
  }, [zenAutoHide, drawerOpen]);

  /* ───────── handlers ───────── */
  const toggleRadio = useCallback(async () => {
    const a = audioRef.current; if (!a) return;
    if (isPlaying || audioStatus === "loading") {
      a.pause();
      setIsPlaying(false);
      setAudioStatus("idle");
      return;
    }
    setAudioStatus("loading");
    try {
      await a.play();
      setIsPlaying(true);
      setAudioStatus("playing");
    } catch {
      setIsPlaying(false);
      setAudioStatus("error");
    }
  }, [isPlaying, audioStatus]);

  const startPreset = useCallback((min: number) => {
    setFocusPhase("focus");
    setDuration(min * 60);
    setRemaining(min * 60);
    setTimerRunning(true);
    setTimerMode(true);
    setCustomOpen(false);
  }, []);

  const toggleTimerRunning = useCallback(() => {
    if (remaining === 0) { setRemaining(duration); setTimerRunning(true); } else setTimerRunning((v) => !v);
  }, [remaining, duration]);

  const closeTimer = useCallback(() => { setTimerMode(false); setTimerRunning(false); }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
    else document.exitFullscreen().catch(() => {});
  }, []);

  // keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) return;
      if (e.key === " ") {
        e.preventDefault();
        if (timerMode) toggleTimerRunning();
        else toggleRadio();
      } else if (e.key === "r" || e.key === "R") {
        toggleRadio();
      } else if (e.key === "m" || e.key === "M") {
        setVolume((v) => (v === 0 ? 55 : 0));
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      } else if (e.key === "d" || e.key === "D") {
        setDrawerOpen((v) => !v);
      } else if (e.key === "Escape") {
        setDrawerOpen(false);
        setCustomOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [timerMode, toggleTimerRunning, toggleRadio, toggleFullscreen]);

  /* ───────── computed ───────── */
  const h = now.getHours() + now.getMinutes() / 60;
  let localPhase: SkyPhase = "day";
  if (h >= 5 && h < 7) localPhase = "dawn";
  else if (h >= 17 && h < 20) localPhase = "golden";
  else if (h >= 20 || h < 5) localPhase = "night";

  const phase = skyOverride === "auto" ? (solarPhase ?? localPhase) : skyOverride;
  const sunProg = solarProgress ?? Math.max(0, Math.min(100, ((h - 6) / 14) * 100));
  const moonData = getMoonPhase(now);
  const timeLabel = mounted ? formatTime(now, use12h) : "--:--";
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
      <WeatherParticles weather={weather} phase={phase} />
      <Character phase={phase} />

      {/* UI */}
      <TopBar
        locationName={locationName}
        weather={weather}
        phase={phase}
        moonData={moonData}
        isFullscreen={isFullscreen}
        zenDimmed={zenDimmed}
        onToggleFullscreen={toggleFullscreen}
        onToggleDrawer={() => setDrawerOpen((v) => !v)}
      />

      <section className="absolute z-[3] inset-[74px_24px_118px] grid place-items-center max-md:inset-[70px_12px_104px]">
        <ClockDisplay
          timeLabel={timeLabel}
          dateLabel={dateLabel}
          weather={weather}
          now={now}
          phase={phase}
          minimized={timerMode}
          onStartTimer={() => setTimerMode(true)}
        />
        <FocusTimer
          active={timerMode}
          duration={duration}
          remaining={remaining}
          timerRunning={timerRunning}
          focusPhase={focusPhase}
          sessionsCompleted={sessionsCompleted}
          customOpen={customOpen}
          customMinutes={customMinutes}
          phase={phase}
          onStartPreset={startPreset}
          onToggleRunning={toggleTimerRunning}
          onClose={closeTimer}
          onSetCustomOpen={setCustomOpen}
          onSetCustomMinutes={setCustomMinutes}
        />
      </section>

      <RadioDock
        isPlaying={isPlaying}
        audioStatus={audioStatus}
        radioMeta={radioMeta}
        volume={volume}
        phase={phase}
        zenDimmed={zenDimmed}
        onToggleRadio={toggleRadio}
        onSetVolume={setVolume}
      />

      <SideDrawer
        open={drawerOpen}
        volume={volume}
        radioUrl={radioUrl}
        isFullscreen={isFullscreen}
        phase={phase}
        skyOverride={skyOverride}
        use12h={use12h}
        zenAutoHide={zenAutoHide}
        rainLevel={rainLevel}
        windLevel={windLevel}
        fireLevel={fireLevel}
        onClose={() => setDrawerOpen(false)}
        onSetVolume={setVolume}
        onSetRadioUrl={setRadioUrl}
        onToggleFullscreen={toggleFullscreen}
        onSetSkyOverride={setSkyOverride}
        onSetUse12h={setUse12h}
        onSetZenAutoHide={setZenAutoHide}
        onSetRainLevel={setRainLevel}
        onSetWindLevel={setWindLevel}
        onSetFireLevel={setFireLevel}
      />

      {/* Audio element */}
      {radioUrl ? <audio ref={audioRef} src={radioUrl} preload="none" crossOrigin="anonymous" /> : <audio ref={audioRef} preload="none" />}
    </main>
  );
}
