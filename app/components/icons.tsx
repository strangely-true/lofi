import {
  Play,
  Pause,
  Volume2,
  Volume1,
  VolumeX,
  Timer,
  MapPin,
  Maximize2,
  Minimize2,
  ExternalLink,
  SlidersHorizontal,
  X,
  Radio,
  RotateCcw,
  CloudRain,
  Wind,
  Flame,
  Loader2,
} from "lucide-react";

export type IconName =
  | "play"
  | "pause"
  | "volume"
  | "volume-low"
  | "volume-mute"
  | "timer"
  | "location"
  | "fullscreen"
  | "exit-fullscreen"
  | "link"
  | "sliders"
  | "close"
  | "radio"
  | "reset"
  | "rain"
  | "wind"
  | "fire"
  | "loader";

const ICONS = {
  play: Play,
  pause: Pause,
  volume: Volume2,
  "volume-low": Volume1,
  "volume-mute": VolumeX,
  timer: Timer,
  location: MapPin,
  fullscreen: Maximize2,
  "exit-fullscreen": Minimize2,
  link: ExternalLink,
  sliders: SlidersHorizontal,
  close: X,
  radio: Radio,
  reset: RotateCcw,
  rain: CloudRain,
  wind: Wind,
  fire: Flame,
  loader: Loader2,
} as const;

export function Icon({
  name,
  size = 18,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const Component = ICONS[name];
  const filled = name === "play" || name === "pause";
  return (
    <Component
      size={size}
      strokeWidth={filled ? 2 : 1.75}
      fill={filled ? "currentColor" : "none"}
      className={name === "play" ? `translate-x-[1px] ${className ?? ""}`.trim() : className}
      aria-hidden="true"
    />
  );
}
