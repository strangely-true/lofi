import {
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
  SkipForward,
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
  | "loader"
  | "skip";

const ICONS = {
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
  skip: SkipForward,
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
  if (name === "play") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={`translate-x-[1px] ${className ?? ""}`.trim()}
        aria-hidden="true"
      >
        <path d="M7.5 5.25a1.25 1.25 0 0 1 1.9-.1l9.5 6a1.25 1.25 0 0 1 0 2.1l-9.5 6A1.25 1.25 0 0 1 7.5 18.2V5.25Z" />
      </svg>
    );
  }
  if (name === "pause") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <rect x="6.5" y="5" width="3.75" height="14" rx="1.6" />
        <rect x="13.75" y="5" width="3.75" height="14" rx="1.6" />
      </svg>
    );
  }
  const Component = ICONS[name];
  return (
    <Component
      size={size}
      strokeWidth={1.75}
      className={className}
      aria-hidden="true"
    />
  );
}
