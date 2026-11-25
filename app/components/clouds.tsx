import type { SkyPhase } from "../lib/types";
import type { CSSProperties } from "react";

export function Clouds({ cloudCover, phase, aqi = null }: { cloudCover: number; phase: SkyPhase; aqi?: number | null }) {
  const isNight = phase === "night" || phase === "twilight" || phase === "dusk";
  const clamped = Math.max(0, Math.min(100, cloudCover));
  const cloudOpacity = isNight
    ? 0.03 + (clamped / 100) * 0.1
    : 0.06 + (clamped / 100) * 0.62;
  const isSmoggy = aqi != null && aqi > 120;
  const cloudBase = isNight
    ? isSmoggy ? "bg-stone-400/20" : "bg-blue-200/25"
    : isSmoggy ? "bg-stone-200/40" : "bg-white/40";

  return (
    <>
      <div className={`absolute -z-10 left-[8%] top-[18%] w-[36vw] h-[8vw] min-h-[70px] max-h-[110px] rounded-full blur-[18px] animate-cloud-drift ${cloudBase}`}
        style={{ opacity: cloudOpacity }} aria-hidden="true" />
      <div className={`absolute -z-10 right-[-5%] top-[38%] w-[28vw] h-[8vw] min-h-[70px] max-h-[110px] rounded-full blur-[18px] ${cloudBase}`}
        style={{ opacity: cloudOpacity, animation: "cloud-drift 38s ease-in-out infinite alternate-reverse" }} aria-hidden="true" />
      <div className={`absolute -z-10 left-[40%] top-[55%] w-[22vw] h-[8vw] min-h-[70px] max-h-[110px] rounded-full blur-[24px] ${cloudBase}`}
        style={{ opacity: cloudOpacity * 0.6, animation: "cloud-drift 44s ease-in-out infinite alternate" }} aria-hidden="true" />

      {/* Horizon glow */}
      <div className={`absolute -z-10 left-[8%] right-[8%] bottom-[8%] h-[28%] rounded-full blur-[36px] transition-all duration-[1800ms] ${
        isNight ? "opacity-[0.03] bg-[#566a8a]" : "opacity-[0.16] bg-[rgba(255,235,200,0.9)]"
      }`} aria-hidden="true" />

      {/* Atmosphere */}
      <div className="absolute -z-10 inset-0 pointer-events-none bg-[linear-gradient(120deg,transparent_68%,rgba(255,255,255,0.04)),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.12),transparent_38%)]"
        style={{ opacity: cloudOpacity } as CSSProperties} />
    </>
  );
}
