"use client";

import { useEffect, useRef, useState, useCallback, type CSSProperties } from "react";

/* ───────── types ───────── */
type SkyPhase = "dawn" | "day" | "golden" | "night";

interface WeatherInfo {
  temperature: number;
  description: string;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
}

/* ───────── constants ───────── */
const PRESETS = [
  { label: "Focus", minutes: 25 },
  { label: "Short", minutes: 5 },
  { label: "Deep", minutes: 50 },
];

const WMO_DESCRIPTIONS: Record<number, string> = {
  0: "Clear sky",
  1: "Mainly clear",
  2: "Partly cloudy",
  3: "Overcast",
  45: "Foggy",
  48: "Rime fog",
  51: "Light drizzle",
  53: "Moderate drizzle",
  55: "Dense drizzle",
  56: "Freezing drizzle",
  57: "Dense freezing drizzle",
  61: "Slight rain",
  63: "Moderate rain",
  65: "Heavy rain",
  66: "Freezing rain",
  67: "Heavy freezing rain",
  71: "Slight snow",
  73: "Moderate snow",
  75: "Heavy snow",
  77: "Snow grains",
  80: "Slight showers",
  81: "Moderate showers",
  82: "Violent showers",
  85: "Slight snow showers",
  86: "Heavy snow showers",
  95: "Thunderstorm",
  96: "Thunderstorm with hail",
  99: "Thunderstorm with heavy hail",
};

/* ───────── moon phase calculation ───────── */
function getMoonPhase(date: Date): { phase: number; name: string; emoji: string } {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  let c = 0;
  let e = 0;
  let jd = 0;
  let b = 0;

  if (month < 3) {
    c = year - 1;
    e = month + 12;
  } else {
    c = year;
    e = month;
  }

  jd = Math.floor(365.25 * (c + 4716)) + Math.floor(30.6001 * (e + 1)) + day - 1524.5;
  b = Math.floor(jd / 36524.25);
  jd = jd + 1 + b - Math.floor(b / 4);

  const daysSinceNew = ((jd - 2451550.1) % 29.530588853);
  const phase = ((daysSinceNew + 29.530588853) % 29.530588853) / 29.530588853;

  let name = "New Moon";
  let emoji = "🌑";

  if (phase < 0.0625) { name = "New Moon"; emoji = "🌑"; }
  else if (phase < 0.1875) { name = "Waxing Crescent"; emoji = "🌒"; }
  else if (phase < 0.3125) { name = "First Quarter"; emoji = "🌓"; }
  else if (phase < 0.4375) { name = "Waxing Gibbous"; emoji = "🌔"; }
  else if (phase < 0.5625) { name = "Full Moon"; emoji = "🌕"; }
  else if (phase < 0.6875) { name = "Waning Gibbous"; emoji = "🌖"; }
  else if (phase < 0.8125) { name = "Last Quarter"; emoji = "🌗"; }
  else if (phase < 0.9375) { name = "Waning Crescent"; emoji = "🌘"; }
  else { name = "New Moon"; emoji = "🌑"; }

  return { phase, name, emoji };
}

/* ───────── generate static star field ───────── */
function generateStars(count: number, seed: number = 42): Array<{ x: number; y: number; size: number; opacity: number; delay: number }> {
  const stars: Array<{ x: number; y: number; size: number; opacity: number; delay: number }> = [];
  let s = seed;
  const rng = () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < count; i++) {
    stars.push({
      x: rng() * 100,
      y: rng() * 70,
      size: 0.5 + rng() * 2,
      opacity: 0.3 + rng() * 0.7,
      delay: rng() * 8,
    });
  }
  return stars;
}

const STAR_FIELD = generateStars(120);
const STAR_FIELD_DIM = generateStars(40, 99);

/* ───────── icon component ───────── */
function Icon({
  name,
  size = 20,
}: {
  name: "play" | "pause" | "volume" | "settings" | "timer" | "location" | "fullscreen" | "exit-fullscreen" | "chevron" | "link";
  size?: number;
}) {
  const paths: Record<string, React.ReactNode> = {
    play: <path d="M8 5.4v13.2L18.5 12 8 5.4Z" fill="currentColor" />,
    pause: (
      <>
        <rect x="7" y="5" width="3.5" height="14" rx="1.75" fill="currentColor" />
        <rect x="13.5" y="5" width="3.5" height="14" rx="1.75" fill="currentColor" />
      </>
    ),
    volume: (
      <>
        <path d="M11 5 6.8 8.5H3.5v7h3.3L11 19V5Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M15 8.2c1.5 1.8 1.5 5.8 0 7.6M17.8 5.8c3 3.3 3 9.1 0 12.4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <path d="M19.4 13.5v-3l-2-.5-.5-1.2 1-1.8-2.1-2.1-1.8 1-1.2-.5-.5-2h-3l-.5 2-1.2.5-1.8-1L3.7 7l1 1.8-.5 1.2-2 .5v3l2 .5.5 1.2-1 1.8 2.1 2.1 1.8-1 1.2.5.5 2h3l.5-2 1.2-.5 1.8 1 2.1-2.1-1-1.8.5-1.2 2-.5Z" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" />
      </>
    ),
    timer: (
      <>
        <circle cx="12" cy="13" r="7" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <path d="M9 2h6M12 2v4M17.5 7.5l1.5-1.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </>
    ),
    location: (
      <>
        <path d="M12 21s6-5.5 6-12A6 6 0 1 0 6 9c0 6.5 6 12 6 12Z" fill="none" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="12" cy="9" r="2" fill="currentColor" />
      </>
    ),
    fullscreen: (
      <>
        <path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    "exit-fullscreen": (
      <>
        <path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    chevron: (
      <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    ),
    link: (
      <>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

/* ───────── formatters (hydration-safe) ───────── */
function formatTime(date: Date) {
  const h = date.getHours().toString().padStart(2, "0");
  const m = date.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

function formatDateLabel(date: Date) {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}`;
}

function formatTimer(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/* ───────── shooting star component ───────── */
function ShootingStars() {
  return (
    <div className="shooting-stars" aria-hidden="true">
      <div className="shooting-star shooting-star-1" />
      <div className="shooting-star shooting-star-2" />
      <div className="shooting-star shooting-star-3" />
    </div>
  );
}

/* ───────── main component ───────── */
export default function Home() {
  /* ── state ── */
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(() => new Date(0));
  const [solarProgress, setSolarProgress] = useState<number | null>(null);
  const [solarPhase, setSolarPhase] = useState<SkyPhase | null>(null);
  const [locationName, setLocationName] = useState("Locating…");
  const [cloudCover, setCloudCover] = useState(20);
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [timerMode, setTimerMode] = useState(false);
  const [duration, setDuration] = useState(25 * 60);
  const [remaining, setRemaining] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("30");
  const [radioOpen, setRadioOpen] = useState(false);
  const [radioUrl, setRadioUrl] = useState("https://ice1.somafm.com/groovesalad-128-mp3");
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(55);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  /* ── mount + clock ── */
  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const clock = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(clock);
  }, []);

  /* ── geolocation + weather + solar data ── */
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationName("Local sky");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Reverse geocode for city name
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10&accept-language=en`
          );
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            const city =
              geoData.address?.city ||
              geoData.address?.town ||
              geoData.address?.village ||
              geoData.address?.county ||
              geoData.address?.state;
            const country = geoData.address?.country;
            if (city) {
              setLocationName(country ? `${city}, ${country}` : city);
            } else {
              const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
              setLocationName(zone.split("/").pop()?.replaceAll("_", " ") || "Local sky");
            }
          }
        } catch {
          const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          setLocationName(zone.split("/").pop()?.replaceAll("_", " ") || "Local sky");
        }

        // Weather + solar data
        try {
          const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=sunrise,sunset&current=temperature_2m,weather_code,cloud_cover,wind_speed_10m,relative_humidity_2m&timezone=auto&forecast_days=1`
          );
          if (!response.ok) return;
          const data = await response.json();

          setCloudCover(data.current?.cloud_cover ?? 20);

          if (data.current) {
            const code = data.current.weather_code ?? 0;
            setWeather({
              temperature: Math.round(data.current.temperature_2m ?? 0),
              description: WMO_DESCRIPTIONS[code] ?? "Unknown",
              weatherCode: code,
              windSpeed: Math.round(data.current.wind_speed_10m ?? 0),
              humidity: Math.round(data.current.relative_humidity_2m ?? 0),
            });
          }

          const sunrise = data.daily?.sunrise?.[0];
          const sunset = data.daily?.sunset?.[0];
          if (sunrise && sunset) {
            const rise = new Date(sunrise);
            const set = new Date(sunset);
            const riseMinutes = rise.getHours() * 60 + rise.getMinutes();
            const setMinutes = set.getHours() * 60 + set.getMinutes();
            const current = new Date();
            const currentMinutes = current.getHours() * 60 + current.getMinutes();
            const progress = ((currentMinutes - riseMinutes) / (setMinutes - riseMinutes)) * 100;
            setSolarProgress(Math.max(0, Math.min(100, progress)));
            let nextPhase: SkyPhase = "day";
            if (currentMinutes >= riseMinutes - 45 && currentMinutes < riseMinutes + 75) nextPhase = "dawn";
            else if (currentMinutes >= setMinutes - 90 && currentMinutes < setMinutes + 30) nextPhase = "golden";
            else if (currentMinutes >= setMinutes + 30 || currentMinutes < riseMinutes - 45) nextPhase = "night";
            else nextPhase = "day";
            setSolarPhase(nextPhase);
          }
        } catch {
          // Keep the graceful local-time fallback.
        }
      },
      () => {
        setLocationName("Local sky");
      },
      { maximumAge: 600000, timeout: 8000 }
    );
  }, []);

  /* ── timer tick ── */
  useEffect(() => {
    if (!timerRunning) return;
    const tick = window.setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          window.clearInterval(tick);
          setTimerRunning(false);
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(tick);
  }, [timerRunning]);

  /* ── volume sync ── */
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume / 100;
  }, [volume]);

  /* ── fullscreen listener ── */
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  /* ── radio controls ── */
  async function toggleRadio() {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }
    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  }

  function startPreset(minutes: number) {
    setDuration(minutes * 60);
    setRemaining(minutes * 60);
    setTimerRunning(true);
    setTimerMode(true);
    setCustomOpen(false);
  }

  function toggleTimerRunning() {
    if (remaining === 0) {
      setRemaining(duration);
      setTimerRunning(true);
    } else {
      setTimerRunning((value) => !value);
    }
  }

  function closeTimer() {
    setTimerMode(false);
    setTimerRunning(false);
  }

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  /* ── computed ── */
  const decimalHour = now.getHours() + now.getMinutes() / 60;
  let localPhase: SkyPhase = "day";
  if (decimalHour >= 5 && decimalHour < 7) localPhase = "dawn";
  else if (decimalHour >= 17 && decimalHour < 20) localPhase = "golden";
  else if (decimalHour >= 20 || decimalHour < 5) localPhase = "night";
  const phase = solarPhase ?? localPhase;
  const sunProgress =
    solarProgress ?? Math.max(0, Math.min(100, ((decimalHour - 6) / 14) * 100));
  const skyStyle = {
    "--sun-progress": `${sunProgress}%`,
  } as CSSProperties;
  const timerProgress = duration ? ((duration - remaining) / duration) * 100 : 0;
  const moonData = getMoonPhase(now);

  const dateLabel = mounted ? formatDateLabel(now) : "";
  const timeLabel = mounted ? formatTime(now) : "--:--";

  return (
    <main className={`sky ${phase}`} style={skyStyle}>
      {/* ── stars ── */}
      <div className="stars-layer" aria-hidden="true">
        {STAR_FIELD.map((star, i) => (
          <div
            key={i}
            className="star"
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
        {STAR_FIELD_DIM.map((star, i) => (
          <div
            key={`d${i}`}
            className="star star-dim"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size * 0.6}px`,
              height: `${star.size * 0.6}px`,
              opacity: star.opacity * 0.4,
              animationDelay: `${star.delay + 2}s`,
            }}
          />
        ))}
      </div>

      {/* ── shooting stars ── */}
      <ShootingStars />

      {/* ── clouds ── */}
      <div className="cloud cloud-one" aria-hidden="true" />
      <div className="cloud cloud-two" aria-hidden="true" />
      <div className="cloud cloud-three" aria-hidden="true" />
      <div className="horizon-glow" aria-hidden="true" />

      {/* ── celestial body (sun / moon) ── */}
      <div className="celestial" aria-hidden="true">
        <div className="celestial-core" />
        {phase === "night" && (
          <div
            className="moon-shadow"
            style={{
              "--moon-phase": moonData.phase,
            } as CSSProperties}
          />
        )}
      </div>

      {/* ── moon craters (night only) ── */}
      {phase === "night" && (
        <div className="moon-details" aria-hidden="true">
          <div className="crater crater-1" />
          <div className="crater crater-2" />
          <div className="crater crater-3" />
        </div>
      )}

      <div className="atmosphere" style={{ "--cloud-opacity": cloudCover > 65 ? 0.72 : 0.35 } as CSSProperties} />

      {/* ── top bar ── */}
      <header className="topbar">
        <button className="location-pill glass" type="button" onClick={() => navigator.geolocation?.getCurrentPosition(() => undefined)}>
          <Icon name="location" size={15} />
          <span>{locationName}</span>
        </button>
        <div className="topbar-right">
          {weather && (
            <div className="weather-pill glass">
              <span className="weather-temp">{weather.temperature}°C</span>
              <span className="weather-sep">·</span>
              <span className="weather-desc">{weather.description}</span>
            </div>
          )}
          <div className="sky-status">
            <span className="status-dot" />
            <span>
              {phase === "night"
                ? `${moonData.name} ${moonData.emoji}`
                : phase === "dawn"
                ? "Morning light"
                : phase === "golden"
                ? "Golden hour"
                : "Soft daylight"}
            </span>
          </div>
          <button
            className="fullscreen-btn glass"
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            <Icon name={isFullscreen ? "exit-fullscreen" : "fullscreen"} size={16} />
          </button>
        </div>
      </header>

      {/* ── center stage ── */}
      <section className={`center-stage ${timerMode ? "timer-active" : ""}`}>
        {!timerMode ? (
          <div className="clock-wrap">
            <time className="clock" dateTime={now.toISOString()} suppressHydrationWarning>
              {timeLabel}
            </time>
            <p className="date-label" suppressHydrationWarning>{dateLabel}</p>
            {weather && (
              <div className="weather-detail" suppressHydrationWarning>
                <span>{weather.temperature}°C</span>
                <span className="weather-detail-sep">·</span>
                <span>Humidity {weather.humidity}%</span>
                <span className="weather-detail-sep">·</span>
                <span>Wind {weather.windSpeed} km/h</span>
              </div>
            )}
            <button className="timer-enter glass" type="button" onClick={() => setTimerMode(true)}>
              <Icon name="timer" size={18} />
              <span>Start focus</span>
            </button>
          </div>
        ) : (
          <div className="timer-wrap">
            <div
              className="timer-ring"
              style={{ "--timer-progress": `${timerProgress * 3.6}deg` } as CSSProperties}
            >
              <div className="timer-glass">
                <span className="timer-label">FOCUS</span>
                <time className="timer-time" dateTime={`PT${remaining}S`}>
                  {formatTimer(remaining)}
                </time>
              </div>
            </div>
            <div className="preset-row">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  className={duration === preset.minutes * 60 ? "preset active" : "preset"}
                  type="button"
                  onClick={() => startPreset(preset.minutes)}
                >
                  {preset.label}
                  <span>{preset.minutes}</span>
                </button>
              ))}
              <button
                className="preset custom"
                type="button"
                onClick={() => setCustomOpen((value) => !value)}
              >
                Custom
                <span>+</span>
              </button>
            </div>

            {customOpen && (
              <form
                className="custom-popover glass"
                onSubmit={(event) => {
                  event.preventDefault();
                  const minutes = Number(customMinutes);
                  if (minutes > 0) startPreset(Math.min(minutes, 180));
                }}
              >
                <label htmlFor="custom-time">Minutes</label>
                <input
                  id="custom-time"
                  type="number"
                  min="1"
                  max="180"
                  value={customMinutes}
                  onChange={(event) => setCustomMinutes(event.target.value)}
                />
                <button type="submit">Set</button>
              </form>
            )}

            <div className="timer-actions">
              <button className="timer-main" type="button" onClick={toggleTimerRunning}>
                <Icon name={timerRunning ? "pause" : "play"} size={22} />
              </button>
              <button className="timer-close" type="button" onClick={closeTimer}>
                Exit
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ── radio dock ── */}
      <aside className={`radio-dock glass ${radioOpen ? "open" : ""}`}>
        <button
          className="radio-play"
          type="button"
          onClick={toggleRadio}
          aria-label={isPlaying ? "Pause radio" : "Play radio"}
        >
          <Icon name={isPlaying ? "pause" : "play"} size={19} />
        </button>
        <button className="radio-meta" type="button" onClick={() => setRadioOpen((value) => !value)}>
          <span className="radio-title">{isPlaying ? "Lofi Radio" : "Ready to listen"}</span>
          <span className="radio-subtitle">{isPlaying ? "Live stream" : "SomaFM"}</span>
        </button>
        <div className="volume-control">
          <Icon name="volume" size={18} />
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            aria-label="Volume"
          />
        </div>
        <button
          className="radio-settings"
          type="button"
          onClick={() => setRadioOpen((value) => !value)}
          aria-label="Radio settings"
        >
          <Icon name="settings" size={18} />
        </button>
        {radioOpen && (
          <form
            className="radio-url glass"
            onSubmit={(event) => {
              event.preventDefault();
              setRadioOpen(false);
            }}
          >
            <label htmlFor="radio-url">Radio stream URL</label>
            <input
              id="radio-url"
              type="url"
              value={radioUrl}
              onChange={(event) => setRadioUrl(event.target.value)}
            />
          </form>
        )}
      </aside>

      {/* ── credit drawer ── */}
      <div className={`credit-drawer ${drawerOpen ? "open" : ""}`}>
        <button
          className="credit-toggle"
          type="button"
          onClick={() => setDrawerOpen((v) => !v)}
          aria-label="Credits"
        >
          <span className="credit-toggle-label">S</span>
          <Icon name="chevron" size={12} />
        </button>
        {drawerOpen && (
          <div className="credit-content glass">
            <p className="credit-name">Sabittwa</p>
            <a
              href="https://strangelytrue.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="credit-link"
            >
              <Icon name="link" size={13} />
              <span>strangelytrue.vercel.app</span>
            </a>
          </div>
        )}
      </div>

      {/* ── audio (only render when src is non-empty) ── */}
      {radioUrl ? (
        <audio ref={audioRef} src={radioUrl} preload="none" />
      ) : (
        <audio ref={audioRef} preload="none" />
      )}
    </main>
  );
}
