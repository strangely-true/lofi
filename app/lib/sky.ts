import type { SkyPhase } from "./types";
import type { CSSProperties } from "react";

export const SKY_GRADIENTS: Record<SkyPhase, CSSProperties> = {
  day: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.08), transparent 42%), linear-gradient(180deg, #79aabd 0%, #a7c2c6 58%, #d8bda5 100%)",
  },
  dawn: {
    background: "linear-gradient(180deg, rgba(255,214,174,0.18), transparent 48%), linear-gradient(180deg, #6d849e 0%, #b09aa8 48%, #efad82 78%, #d8b8a2 100%)",
  },
  golden: {
    background: "linear-gradient(180deg, rgba(255,239,194,0.12), transparent 44%), linear-gradient(180deg, #879db1 0%, #cfaa9f 58%, #efb06f 100%)",
  },
  night: {
    background: "radial-gradient(ellipse at 74% 22%, rgba(80,100,150,0.14), transparent 36%), radial-gradient(ellipse at 20% 60%, rgba(40,50,90,0.12), transparent 40%), linear-gradient(180deg, #0a0e1a 0%, #111d35 36%, #1c2d4a 56%, #2a3550 76%, #3d4260 100%)",
  },
};
