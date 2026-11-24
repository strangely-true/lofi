import type { SkyPhase } from "./types";
import type { CSSProperties } from "react";

export const SKY_GRADIENTS: Record<SkyPhase, CSSProperties> = {
  night: {
    background:
      "radial-gradient(ellipse at 74% 22%, rgba(80,100,150,0.14), transparent 36%), radial-gradient(ellipse at 20% 60%, rgba(40,50,90,0.12), transparent 40%), linear-gradient(180deg, #070b14 0%, #0f192d 36%, #192946 60%, #26324d 82%, #353c59 100%)",
  },
  twilight: {
    background:
      "linear-gradient(180deg, rgba(160,130,190,0.12), transparent 45%), linear-gradient(180deg, #1b2238 0%, #374363 44%, #6a5a7a 78%, #9c747e 100%)",
  },
  dawn: {
    background:
      "linear-gradient(180deg, rgba(255,214,174,0.18), transparent 48%), linear-gradient(180deg, #566e8c 0%, #9b8da2 46%, #ea9f79 78%, #e4bfa6 100%)",
  },
  morning: {
    background:
      "linear-gradient(180deg, rgba(255,245,220,0.14), transparent 45%), linear-gradient(180deg, #6495b0 0%, #8fb8c9 54%, #d3cdc1 100%)",
  },
  day: {
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.08), transparent 42%), linear-gradient(180deg, #74a6ba 0%, #a2c1c7 58%, #d7c1ab 100%)",
  },
  afternoon: {
    background:
      "linear-gradient(180deg, rgba(255,236,198,0.12), transparent 44%), linear-gradient(180deg, #7b9ab2 0%, #b4b5b6 54%, #e2bd97 100%)",
  },
  golden: {
    background:
      "linear-gradient(180deg, rgba(255,225,165,0.16), transparent 44%), linear-gradient(180deg, #6e7d99 0%, #c48e86 52%, #ef9c5a 86%, #d97c54 100%)",
  },
  dusk: {
    background:
      "linear-gradient(180deg, rgba(110,90,150,0.14), transparent 48%), linear-gradient(180deg, #1a2138 0%, #2f3859 42%, #594a6e 76%, #7d5366 100%)",
  },
};
