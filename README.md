Just a small lofi site I need. Nothing important, will host on lofi.strangelytrue.dev .

## Still — Lofi Focus Timer, Live Sky & Ambient Radio

A calm, distraction-free lofi workspace built with Next.js, React 19, and Tailwind CSS.

### Features

- **Live Astronomical Sky & Moon:** Real-time solar and lunar azimuth/altitude (`suncalc`), accurate 8-phase moon rendering, twilight/dawn/morning/day/afternoon/golden/dusk/night gradients, and subtle shooting stars.
- **Location, Weather & Air Quality:** HTTPS IP geolocation (with browser geolocation fallback) and live Open-Meteo weather + US AQI (`us_aqi`, `pm2_5`) data, plus click-to-refresh on the location pill.
- **Unified Weather & Atmosphere:** Multi-layer parallax rain with horizon splashes, thunderstorm sheet flashes & forked lightning, snow, fog, wind streaks, cloud-cover-reactive clouds, and a lower-sky AQI smog gradient.
- **Lofi Radio & Ambient Mixer:** Stream player with `/api/stream` proxy fallback, audio-reactive horizon waves (`calm`, `smooth`, `reactive`), and procedural Web Audio ambient channels (rain, wind, warmth).
- **Focus Timer & Zen Mode:** Pomodoro presets (`25m`, `5m`, `15m`) or custom durations, keyboard shortcuts (`Space`, `R`, `M`, `F`, `D`, `Esc`), 12h/24h clock, and auto-hide zen mode.

### Development

```bash
pnpm install
pnpm dev
```

Build and lint:

```bash
pnpm build
pnpm lint
```
