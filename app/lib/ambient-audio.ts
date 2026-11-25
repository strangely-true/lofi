import * as Tone from "tone";

/* ── Tone.js audio engine: polyphonic chimes + ambient soundscapes ── */

let chimeSynth: Tone.PolySynth | null = null;
let chimeReverb: Tone.Reverb | null = null;

async function ensureToneStarted(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (Tone.getContext().state !== "running") {
    try {
      await Tone.start();
    } catch {
      return false;
    }
  }
  return true;
}

/** Warm polyphonic singing-bowl / bell chime using Tone.js. */
export async function playTimerChime(): Promise<void> {
  const ok = await ensureToneStarted();
  if (!ok) return;

  if (!chimeReverb) {
    chimeReverb = new Tone.Reverb({ decay: 3.5, wet: 0.55 }).toDestination();
  }
  if (!chimeSynth) {
    chimeSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "sine" },
      envelope: { attack: 0.03, decay: 1.8, sustain: 0.05, release: 2.4 },
      volume: -10,
    }).connect(chimeReverb);
  }

  const now = Tone.now();
  chimeSynth.triggerAttackRelease("C5", "2n", now);
  chimeSynth.triggerAttackRelease("E5", "2n", now + 0.16);
  chimeSynth.triggerAttackRelease("G5", "2n", now + 0.32);
  chimeSynth.triggerAttackRelease("D6", "1n", now + 0.48);
}

type AmbientChannel = "rain" | "wind" | "fire";

interface ChannelNodes {
  noise: Tone.Noise;
  filter: Tone.Filter;
  gain: Tone.Gain;
}

const channels: Partial<Record<AmbientChannel, ChannelNodes>> = {};
const desiredLevels: Record<AmbientChannel, number> = { rain: 0, wind: 0, fire: 0 };

function ensureChannel(name: AmbientChannel): ChannelNodes {
  const existing = channels[name];
  if (existing) return existing;

  const noise = new Tone.Noise(name === "rain" ? "pink" : "brown");
  const filter = new Tone.Filter({
    type: name === "wind" ? "bandpass" : "lowpass",
    frequency: name === "rain" ? 1850 : name === "wind" ? 360 : 280,
    Q: name === "wind" ? 1.5 : 0.7,
  });
  const gain = new Tone.Gain(0).toDestination();

  noise.connect(filter);
  filter.connect(gain);
  noise.start();

  const node = { noise, filter, gain };
  channels[name] = node;
  return node;
}

/** Update an ambient channel's volume (0..100). */
export async function setAmbientLevel(name: AmbientChannel, level: number): Promise<void> {
  const clamped = Math.max(0, Math.min(100, level));
  desiredLevels[name] = clamped;
  if (clamped === 0 && !channels[name]) return;
  const ok = await ensureToneStarted();
  if (!ok) return;
  const node = ensureChannel(name);
  const target = (clamped / 100) * (name === "fire" ? 0.42 : name === "wind" ? 0.32 : 0.26);
  node.gain.gain.rampTo(target, 0.2);
}

/** Re-apply any non-zero ambient levels once a user gesture unlocks Web Audio. */
export async function resumeAmbientAudio(): Promise<void> {
  const active = (Object.keys(desiredLevels) as AmbientChannel[]).filter((k) => desiredLevels[k] > 0);
  if (active.length === 0) return;
  const ok = await ensureToneStarted();
  if (!ok) return;
  await Promise.all(active.map((name) => setAmbientLevel(name, desiredLevels[name])));
}
