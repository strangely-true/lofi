"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { SkyPhase, WeatherInfo, RadioMeta } from "./lib/types";
import { formatTime, formatTimer, formatDateLabel, getMoonPhase, getCelestialState, generateStars } from "./lib/utils";
import { DEFAULT_RADIO_URL } from "./lib/constants";
import { SKY_GRADIENTS } from "./lib/sky";
import { fetchLocationByIP, browserGeolocation, reverseGeocode, fetchWeatherAndSolar } from "./lib/data";
import { playTimerChime, setAmbientLevel } from "./lib/ambient-audio";

import { StarField, ShootingStars } from "./components/star-field";
import { Celestial } from "./components/celestial";
import { Clouds } from "./components/clouds";
import { WeatherParticles } from "./components/weather-particles";
import { Horizon, type HorizonWaveMode } from "./components/horizon";
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
  const [sceneReady, setSceneReady] = useState(false);
  const [animateCelestial, setAnimateCelestial] = useState(false);
  const [now, setNow] = useState(() => new Date(0));

  // sky & location
  const [coords, setCoords] = useState<{ lat: number | null; lon: number | null }>({ lat: null, lon: null });
  const [skyOverride, setSkyOverride] = useState<"auto" | SkyPhase>("auto");
  const [locationName, setLocationName] = useState("Locating…");
  const [cloudCover, setCloudCover] = useState(20);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);

  // pomodoro timer
  const [timerMode, setTimerMode] = useState(false);
  const [focusPhase, setFocusPhase] = useState<"focus" | "break" | "longBreak">("focus");
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
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  // ambient mixer
  const [rainLevel, setRainLevel] = useState(0);
  const [windLevel, setWindLevel] = useState(0);
  const [fireLevel, setFireLevel] = useState(0);

  // ui & prefs
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [use12h, setUse12h] = useState(false);
  const [zenAutoHide, setZenAutoHide] = useState(false);
  const [zenHideMusic, setZenHideMusic] = useState(true);
  const [zenDimmed, setZenDimmed] = useState(false);
  const [waveMode, setWaveMode] = useState<HorizonWaveMode>("calm");

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
        if (typeof p.zenHideMusic === "boolean") setZenHideMusic(p.zenHideMusic);
        if (p.waveMode === "calm" || p.waveMode === "smooth" || p.waveMode === "reactive") setWaveMode(p.waveMode);
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
        JSON.stringify({ volume, radioUrl, use12h, zenAutoHide, zenHideMusic, waveMode, skyOverride, rainLevel, windLevel, fireLevel })
      );
    } catch { /* ignore */ }
  }, [mounted, volume, radioUrl, use12h, zenAutoHide, zenHideMusic, waveMode, skyOverride, rainLevel, windLevel, fireLevel]);

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

  // location → weather (IP first, browser fallback) + snappy initial loader gate
  useEffect(() => {
    let dead = false;
    const readyTimer = setTimeout(() => {
      if (!dead) setSceneReady(true);
    }, 900);

    (async () => {
      let lat: number | null = null, lon: number | null = null;

      const ip = await fetchLocationByIP();
      if (!dead && ip) {
        lat = ip.lat; lon = ip.lon;
        setCoords({ lat, lon });
        setLocationName(ip.country ? `${ip.city}, ${ip.country}` : ip.city);
      }
      if (!dead) {
        clearTimeout(readyTimer);
        setSceneReady(true);
      }

      const geo = await browserGeolocation();
      if (!dead && geo) {
        lat = geo.lat; lon = geo.lon;
        setCoords({ lat, lon });
        const name = await reverseGeocode(geo.lat, geo.lon);
        if (!dead) setLocationName(name);
      }

      if (!dead && lat == null) { setLocationName("Local sky"); return; }
      if (lat == null || lon == null) return;

      const result = await fetchWeatherAndSolar(lat, lon);
      if (!dead && result) {
        setWeather(result.weather);
        setCloudCover(result.cloudCover);
      }
    })();
    return () => { dead = true; clearTimeout(readyTimer); };
  }, []);

  // enable smooth 2s celestial transitions only after initial placement
  useEffect(() => {
    if (!sceneReady) return;
    const id = setTimeout(() => setAnimateCelestial(true), 250);
    return () => clearTimeout(id);
  }, [sceneReady]);

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

  const advancePomodoro = useCallback(() => {
    setTimerRunning(false);
    playTimerChime();
    setFocusPhase((prev) => {
      if (prev === "focus") {
        const nextCount = sessionsCompleted + 1;
        setSessionsCompleted(nextCount);
        const isLong = nextCount % 4 === 0;
        const nextDur = isLong ? 15 * 60 : 5 * 60;
        setDuration(nextDur);
        setRemaining(nextDur);
        return isLong ? "longBreak" : "break";
      }
      setDuration(25 * 60);
      setRemaining(25 * 60);
      return "focus";
    });
  }, [sessionsCompleted]);

  // timer tick
  useEffect(() => {
    if (!timerRunning) return;
    const id = setInterval(() => {
      setRemaining((v) => {
        if (v <= 1) {
          clearInterval(id);
          advancePomodoro();
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [timerRunning, advancePomodoro]);

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
      const label = !timerRunning ? "Paused" : focusPhase === "longBreak" ? "Long Break" : focusPhase === "break" ? "Break" : "Pomodoro";
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
    let timeout = setTimeout(() => setZenDimmed(true), 8000);
    const reset = () => {
      setZenDimmed(false);
      clearTimeout(timeout);
      timeout = setTimeout(() => setZenDimmed(true), 8000);
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
  const ensureAudioAnalyser = useCallback(() => {
    const a = audioRef.current;
    if (!a || sourceNodeRef.current) {
      if (audioCtxRef.current?.state === "suspended") {
        audioCtxRef.current.resume().catch(() => {});
      }
      return;
    }
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const node = ctx.createAnalyser();
      node.fftSize = 512;
      node.smoothingTimeConstant = 0.35;
      const src = ctx.createMediaElementSource(a);
      src.connect(node);
      node.connect(ctx.destination);
      audioCtxRef.current = ctx;
      sourceNodeRef.current = src;
      setAnalyser(node);
    } catch {
      /* Fallback: stream still plays without visualizer */
    }
  }, []);

  const toggleRadio = useCallback(() => {
    const a = audioRef.current; if (!a) return;
    if (isPlaying || audioStatus === "loading") {
      a.pause();
      setIsPlaying(false);
      setAudioStatus("idle");
      return;
    }
    ensureAudioAnalyser();
    setAudioStatus("loading");
    if (audioStatus === "error") {
      a.load();
    }
    const playPromise = a.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setAudioStatus("playing");
        })
        .catch(() => {
          setIsPlaying(false);
          setAudioStatus("error");
        });
    }
  }, [isPlaying, audioStatus, ensureAudioAnalyser]);

  const startPreset = useCallback((min: number, kind: "focus" | "break" | "longBreak" = "focus") => {
    setFocusPhase(kind);
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
  const minuteNow = new Date(Math.floor(now.getTime() / 60000) * 60000);
  const celestial = getCelestialState(minuteNow, coords.lat, coords.lon);
  const phase = skyOverride === "auto" ? celestial.phase : skyOverride;
  const moonData = getMoonPhase(now);
  const timeLabel = mounted ? formatTime(now, use12h) : "--:--";
  const dateLabel = mounted ? formatDateLabel(now) : "";
  const proxiedStreamUrl = radioUrl
    ? `/api/stream?url=${encodeURIComponent(radioUrl)}`
    : "";

  /* ───────── render ───────── */
  return (
    <main
      className="relative w-screen h-dvh overflow-hidden isolate transition-[background] duration-[2000ms] ease-in-out"
      style={SKY_GRADIENTS[phase]}
    >
      {/* Initial loader while resolving clock & sky coordinates */}
      {!sceneReady && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#0a0f1d] transition-opacity duration-500">
          <div className="flex flex-col items-center gap-3">
            <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
            <span className="text-[11px] uppercase tracking-[0.24em] text-white/50">
              Reading sky
            </span>
          </div>
        </div>
      )}

      {/* Background layers */}
      <div className={`contents transition-opacity duration-700 ${sceneReady ? "opacity-100" : "opacity-0"}`}>
        <StarField phase={phase} stars={STARS} dimStars={DIM_STARS} />
        <ShootingStars phase={phase} />
        <Clouds cloudCover={cloudCover} phase={phase} />
        <Celestial phase={phase} sun={celestial.sun} moon={celestial.moon} moonData={moonData} animatePosition={animateCelestial} />
        <WeatherParticles weather={weather} phase={phase} rainLevel={rainLevel} />
        <Horizon phase={phase} analyser={analyser} isPlaying={isPlaying} volume={volume} waveMode={waveMode} />
      </div>

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
          zenDimmed={zenDimmed}
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
          zenDimmed={zenDimmed}
          onStartPreset={startPreset}
          onToggleRunning={toggleTimerRunning}
          onSkipPhase={advancePomodoro}
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
        zenDimmed={zenDimmed && zenHideMusic}
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
        zenHideMusic={zenHideMusic}
        waveMode={waveMode}
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
        onSetZenHideMusic={setZenHideMusic}
        onSetWaveMode={setWaveMode}
        onSetRainLevel={setRainLevel}
        onSetWindLevel={setWindLevel}
        onSetFireLevel={setFireLevel}
      />

      {/* Audio element (same-origin /api/stream proxy enables FFT analysis & iPad Safari playback) */}
      {proxiedStreamUrl ? <audio ref={audioRef} src={proxiedStreamUrl} preload="none" playsInline /> : <audio ref={audioRef} preload="none" playsInline />}
    </main>
  );
}
