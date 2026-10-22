// Countdown percussion, synthesized with the Web Audio API so no audio files
// are needed. The pattern data below is pure and browser-safe; only
// createRhythm() touches AudioContext, and it is called from a click handler.

export const TOTAL_ROUNDS = 10;

export type Voice = "kick" | "snare" | "hat";

export interface Hit {
  /** Seconds from the start of this countdown second. 0 <= at < 1 */
  at: number;
  voice: Voice;
  gain: number;
}

// Slow heartbeat: a low hit and one off-beat tick.
const HEARTBEAT: Hit[] = [
  { at: 0, voice: "kick", gain: 0.9 },
  { at: 0.5, voice: "hat", gain: 0.35 },
];

// Steady march: four even beats.
const MARCH: Hit[] = [
  { at: 0, voice: "kick", gain: 0.9 },
  { at: 0.25, voice: "hat", gain: 0.35 },
  { at: 0.5, voice: "snare", gain: 0.55 },
  { at: 0.75, voice: "hat", gain: 0.4 },
];

// Filling out: six beats, the second half tighter than the first.
const RUSH: Hit[] = [
  { at: 0, voice: "kick", gain: 0.9 },
  { at: 0.25, voice: "hat", gain: 0.4 },
  { at: 0.4, voice: "hat", gain: 0.45 },
  { at: 0.55, voice: "snare", gain: 0.6 },
  { at: 0.7, voice: "hat", gain: 0.5 },
  { at: 0.85, voice: "hat", gain: 0.55 },
];

// Gallop: eight beats with two low hits.
const GALLOP: Hit[] = [
  { at: 0, voice: "kick", gain: 0.95 },
  { at: 0.125, voice: "hat", gain: 0.45 },
  { at: 0.25, voice: "hat", gain: 0.5 },
  { at: 0.375, voice: "snare", gain: 0.6 },
  { at: 0.5, voice: "kick", gain: 0.8 },
  { at: 0.625, voice: "hat", gain: 0.55 },
  { at: 0.75, voice: "snare", gain: 0.65 },
  { at: 0.875, voice: "hat", gain: 0.6 },
];

// Final second: twelve rapid beats, each louder than the one before.
const FINALE: Hit[] = Array.from({ length: 12 }, (_, i) => ({
  at: i / 12,
  voice: (i % 4 === 0 ? "kick" : i % 4 === 2 ? "snare" : "hat") as Voice,
  gain: 0.45 + (i / 11) * 0.5,
}));

/** The one-second pattern played while `round` is on screen (10 down to 1). */
export function patternFor(round: number): Hit[] {
  if (round >= 8) return HEARTBEAT;
  if (round >= 5) return MARCH;
  if (round >= 3) return RUSH;
  if (round === 2) return GALLOP;
  return FINALE;
}

export interface Rhythm {
  /** Begin a countdown: resets the beat grid and resumes audio if needed. */
  start(): void;
  /** Play the pattern for one countdown second. */
  tick(round: number): void;
  /** Cymbal and low boom for the reveal. */
  finish(): void;
  /** Cut the rising tone and stop scheduling new beats. */
  stop(): void;
  setMuted(muted: boolean): void;
}

const MASTER = 0.5;
const RISER_FROM = 4; // last four seconds get a rising tone

export function createRhythm(): Rhythm | null {
  const AC: typeof AudioContext | undefined =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;

  let ctx: AudioContext;
  try {
    ctx = new AC();
  } catch {
    return null;
  }

  const master = ctx.createGain();
  master.gain.value = MASTER;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -12;
  comp.knee.value = 20;
  comp.ratio.value = 6;
  comp.attack.value = 0.003;
  comp.release.value = 0.15;
  master.connect(comp).connect(ctx.destination);

  const noise = (() => {
    const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  })();

  let origin = 0;
  let running = false;
  let riser: { osc: OscillatorNode; gain: GainNode } | null = null;

  const env = (t: number, peak: number, attack: number, decay: number) => {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
    g.connect(master);
    return g;
  };

  const kick = (t: number, gain: number, body = 0.16) => {
    const o = ctx.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(170, t);
    o.frequency.exponentialRampToValueAtTime(48, t + 0.12);
    o.connect(env(t, gain, 0.005, body + 0.08));
    o.start(t);
    o.stop(t + body + 0.25);
  };

  const noiseHit = (
    t: number,
    gain: number,
    type: BiquadFilterType,
    freq: number,
    q: number,
    decay: number,
  ) => {
    const src = ctx.createBufferSource();
    src.buffer = noise;
    src.playbackRate.value = 0.8 + Math.random() * 0.4;
    const filter = ctx.createBiquadFilter();
    filter.type = type;
    filter.frequency.value = freq;
    filter.Q.value = q;
    src.connect(filter).connect(env(t, gain, 0.004, decay));
    src.start(t, Math.random() * 0.5);
    src.stop(t + decay + 0.05);
  };

  const play = (h: Hit, t: number) => {
    if (h.voice === "kick") kick(t, h.gain);
    else if (h.voice === "snare") {
      noiseHit(t, h.gain * 0.8, "bandpass", 1900, 0.8, 0.14);
      kick(t, h.gain * 0.35, 0.08);
    } else noiseHit(t, h.gain, "highpass", 7500, 0.7, 0.06);
  };

  const stopRiser = (t: number) => {
    if (!riser) return;
    const { osc, gain } = riser;
    riser = null;
    try {
      gain.gain.cancelScheduledValues(t);
      gain.gain.setTargetAtTime(0.0001, t, 0.03);
      osc.stop(t + 0.2);
    } catch {
      /* already finished */
    }
  };

  const startRiser = (t: number, dur: number) => {
    if (riser) return;
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + dur);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.Q.value = 6;
    filter.frequency.setValueAtTime(400, t);
    filter.frequency.exponentialRampToValueAtTime(4200, t + dur);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.09, t + dur);
    osc.connect(filter).connect(gain).connect(master);
    osc.start(t);
    osc.stop(t + dur + 0.1);
    riser = { osc, gain };
  };

  return {
    start() {
      if (ctx.state === "suspended") void ctx.resume();
      origin = ctx.currentTime + 0.06;
      running = true;
    },
    tick(round) {
      if (!running) return;
      const base = Math.max(origin + (TOTAL_ROUNDS - round), ctx.currentTime + 0.01);
      for (const h of patternFor(round)) play(h, base + h.at);
      if (round === RISER_FROM) startRiser(base, TOTAL_ROUNDS - RISER_FROM + 0.4);
    },
    finish() {
      const t = ctx.currentTime + 0.01;
      stopRiser(t);
      noiseHit(t, 0.4, "highpass", 5200, 0.5, 1.3);
      kick(t, 0.9, 0.5);
      noiseHit(t + 0.02, 0.22, "bandpass", 2600, 1.2, 0.5);
    },
    stop() {
      running = false;
      stopRiser(ctx.currentTime + 0.01);
    },
    setMuted(muted) {
      master.gain.setTargetAtTime(muted ? 0.0001 : MASTER, ctx.currentTime, 0.02);
    },
  };
}
