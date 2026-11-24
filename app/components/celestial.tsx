import type { SkyPhase, MoonData } from "../lib/types";
import type { CSSProperties } from "react";

export function Celestial({ phase, sunProgress, moonData }: { phase: SkyPhase; sunProgress: number; moonData: MoonData }) {
  const isNight = phase === "night";

  return (
    <>
      {/* Sun / Moon orb */}
      <div
        className={`absolute -z-10 transition-all duration-[2000ms] ease-in-out blur-[0.2px] ${
          isNight ? "left-[76%] bottom-[65%] w-[62px] h-[62px]" : "bottom-[31%] w-[74px] h-[74px]"
        }`}
        style={!isNight ? { left: `${sunProgress}%`, transform: "translateX(-50%)" } : { transform: "translateX(-50%)" }}
        aria-hidden="true"
      >
        <div
          className={`w-full h-full rounded-full relative transition-all duration-[1800ms] ${
            isNight
              ? "bg-[radial-gradient(circle_at_40%_40%,#f5f3e0,#e8e5cf_60%,#dddac4)] shadow-[0_0_32px_8px_rgba(200,210,230,0.15),0_0_80px_20px_rgba(180,195,220,0.08)]"
              : "bg-[rgba(255,245,205,0.96)] shadow-[0_0_28px_12px_rgba(255,221,164,0.48),0_0_80px_32px_rgba(255,226,180,0.16)]"
          }`}
        />
        {isNight && (
          <div className="absolute inset-[-1px] rounded-full bg-[radial-gradient(circle_at_65%_45%,transparent_40%,rgba(15,20,35,0.85)_60%)] opacity-60 pointer-events-none" />
        )}
      </div>

      {/* Moon craters */}
      {isNight && (
        <div className="absolute -z-10 left-[76%] bottom-[65%] w-[62px] h-[62px] -translate-x-1/2 pointer-events-none" aria-hidden="true">
          <div className="absolute w-2.5 h-2.5 rounded-full bg-black/[0.06] shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)] top-[30%] left-[25%]" />
          <div className="absolute w-[7px] h-[7px] rounded-full bg-black/[0.06] shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)] top-1/2 left-[55%]" />
          <div className="absolute w-[5px] h-[5px] rounded-full bg-black/[0.06] shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)] top-[22%] left-1/2" />
        </div>
      )}
    </>
  );
}
