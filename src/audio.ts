let ctx: AudioContext | null = null;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

// Call from a user gesture to satisfy the browser autoplay policy.
export function unlock() {
  ac();
}

// One reverb bus for the whole app: dry signal + a smooth decaying convolution tail.
let bus: GainNode | null = null;
function makeImpulse(c: AudioContext, seconds: number, decay: number): AudioBuffer {
  const len = Math.max(1, Math.floor(c.sampleRate * seconds));
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
  }
  return buf;
}
function busNode(c: AudioContext): AudioNode {
  if (!bus) {
    bus = c.createGain();
    const conv = c.createConvolver();
    conv.buffer = makeImpulse(c, 3, 2.8);
    const wet = c.createGain();
    wet.gain.value = 0.5;
    bus.connect(c.destination); // dry
    bus.connect(conv);
    conv.connect(wet);
    wet.connect(c.destination);
  }
  return bus;
}

function noiseBurst(c: AudioContext, at: number, freq: number, gain: number, dur = 0.05) {
  const frames = Math.ceil(c.sampleRate * dur);
  const buf = c.createBuffer(1, frames, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / frames, 3);
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = freq;
  bp.Q.value = 1.1;
  const g = c.createGain();
  g.gain.value = gain;
  src.connect(bp).connect(g).connect(busNode(c));
  src.start(at);
}

function bodyTone(c: AudioContext, at: number, f0: number, f1: number, gain: number, dur: number) {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(f0, at);
  osc.frequency.exponentialRampToValueAtTime(f1, at + dur * 0.9);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(gain, at + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(g).connect(busNode(c));
  osc.start(at);
  osc.stop(at + dur + 0.02);
}

function clickTone(c: AudioContext, at: number, f: number, gain: number, dur: number) {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = "triangle";
  osc.frequency.setValueAtTime(f, at);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(gain, at + 0.002);
  g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  osc.connect(g).connect(busNode(c));
  osc.start(at);
  osc.stop(at + dur + 0.01);
}

export function tickTock(high: boolean) {
  const c = ac();
  if (!c) return;
  const at = c.currentTime + 0.001;
  // A clock tick is a crisp, bright transient — not a drum. Short, high, fast decay.
  if (high) {
    noiseBurst(c, at, 3000, 0.55, 0.025);
    noiseBurst(c, at, 4300, 0.3, 0.018);
    clickTone(c, at, 2700, 0.32, 0.03);
  } else {
    noiseBurst(c, at, 2100, 0.5, 0.04);
    noiseBurst(c, at, 3200, 0.26, 0.028);
    clickTone(c, at, 1900, 0.26, 0.05);
  }
  // ponytail: a whisper of body for weight; kept short/low so it never reads as a drum.
  bodyTone(c, at, high ? 340 : 270, high ? 210 : 175, 0.1, 0.045);
}

export function clack() {
  const c = ac();
  if (!c) return;
  noiseBurst(c, c.currentTime + 0.001, 2400, 0.3, 0.045);
}

export function toll() {
  const c = ac();
  if (!c) return;
  const at = c.currentTime + 0.001;
  bodyTone(c, at, 120, 55, 0.7, 1.6);
  bodyTone(c, at, 180, 82, 0.3, 1.2);
  noiseBurst(c, at, 900, 0.2, 0.08);
}
