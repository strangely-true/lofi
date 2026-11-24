/* ── Procedural Web Audio engine: chime + ambient soundscapes ── */

let ctx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
  }
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

/** Gentle singing-bowl chime for timer completion. */
export function playTimerChime(): void {
  const ac = getAudioContext();
  if (!ac) return;
  const now = ac.currentTime;
  const freqs = [528, 1056, 1584];
  freqs.forEach((freq, i) => {
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    const peak = 0.14 / (i + 1);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.8 - i * 0.4);
    osc.connect(gain).connect(ac.destination);
    osc.start(now);
    osc.stop(now + 3);
  });
}

type AmbientChannel = "rain" | "wind" | "fire";

interface ChannelNodes {
  gain: GainNode;
  source: AudioBufferSourceNode;
}

const channels: Partial<Record<AmbientChannel, ChannelNodes>> = {};

function createNoiseBuffer(ac: AudioContext, type: "pink" | "brown"): AudioBuffer {
  const length = ac.sampleRate * 4;
  const buffer = ac.createBuffer(1, length, ac.sampleRate);
  const data = buffer.getChannelData(0);
  if (type === "brown") {
    let last = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.2;
    }
  } else {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }
  }
  return buffer;
}

function ensureChannel(name: AmbientChannel): ChannelNodes | null {
  const existing = channels[name];
  if (existing) return existing;
  const ac = getAudioContext();
  if (!ac) return null;

  const source = ac.createBufferSource();
  source.buffer = createNoiseBuffer(ac, name === "rain" ? "pink" : "brown");
  source.loop = true;

  const filter = ac.createBiquadFilter();
  if (name === "rain") {
    filter.type = "lowpass";
    filter.frequency.value = 1800;
  } else if (name === "wind") {
    filter.type = "bandpass";
    filter.frequency.value = 340;
    filter.Q.value = 1.4;
  } else {
    filter.type = "lowpass";
    filter.frequency.value = 260;
  }

  const gain = ac.createGain();
  gain.gain.value = 0;

  source.connect(filter).connect(gain).connect(ac.destination);
  source.start();

  const node = { gain, source };
  channels[name] = node;
  return node;
}

/** Update an ambient channel's volume (0..100). */
export function setAmbientLevel(name: AmbientChannel, level: number): void {
  const clamped = Math.max(0, Math.min(100, level));
  if (clamped === 0 && !channels[name]) return;
  const node = ensureChannel(name);
  if (!node || !ctx) return;
  const target = (clamped / 100) * (name === "fire" ? 0.45 : name === "wind" ? 0.35 : 0.28);
  node.gain.gain.setTargetAtTime(target, ctx.currentTime, 0.15);
}
