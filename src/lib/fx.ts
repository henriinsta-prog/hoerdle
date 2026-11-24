/**
 * Spielgefühl: Konfetti, Vibration, kurze Töne. Alles lässt sich mit einem Schalter abstellen
 * (Menü → „Effekte“) und Konfetti respektiert „Bewegung reduzieren“ des Geräts.
 */

const FX_KEY = "hoerdle-fx";

export function fxEnabled(): boolean {
  try { return localStorage.getItem(FX_KEY) !== "0"; } catch { return true; }
}

export function setFxEnabled(on: boolean) {
  try { localStorage.setItem(FX_KEY, on ? "1" : "0"); } catch { /* egal */ }
}

const reducedMotion = () => typeof window !== "undefined" && Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);

export type FxKind = "right" | "wrong" | "skip" | "win";

/** Vibrationsmuster in Millisekunden (Android; iPhones vibrieren im Browser nicht). */
export const HAPTIC: Record<FxKind, number[]> = {
  right: [30],
  wrong: [70, 40, 70],
  skip: [15],
  win: [40, 60, 40, 60, 160],
};

export function haptic(kind: FxKind) {
  if (!fxEnabled()) return;
  try { navigator.vibrate?.(HAPTIC[kind]); } catch { /* egal */ }
}

type Note = { freq: number; at: number; dur: number; type: OscillatorType; gain: number };

/** Töne als Noten: Frequenz (Hz), Startzeit und Länge (s). */
export const SFX: Record<Exclude<FxKind, "skip">, Note[]> = {
  right: [
    { freq: 660, at: 0, dur: 0.09, type: "sine", gain: 0.12 },
    { freq: 880, at: 0.08, dur: 0.16, type: "sine", gain: 0.12 },
  ],
  wrong: [
    { freq: 220, at: 0, dur: 0.16, type: "sawtooth", gain: 0.07 },
    { freq: 160, at: 0.13, dur: 0.22, type: "sawtooth", gain: 0.07 },
  ],
  win: [
    { freq: 523, at: 0, dur: 0.14, type: "triangle", gain: 0.14 },
    { freq: 659, at: 0.12, dur: 0.14, type: "triangle", gain: 0.14 },
    { freq: 784, at: 0.24, dur: 0.14, type: "triangle", gain: 0.14 },
    { freq: 1047, at: 0.36, dur: 0.4, type: "triangle", gain: 0.14 },
  ],
};

let audio: AudioContext | null = null;

export function sfx(kind: Exclude<FxKind, "skip">) {
  if (!fxEnabled()) return;
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    audio ??= new Ctx();
    void audio.resume?.();
    const t0 = audio.currentTime;
    for (const n of SFX[kind]) {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = n.type;
      osc.frequency.value = n.freq;
      gain.gain.setValueAtTime(0.0001, t0 + n.at);
      gain.gain.exponentialRampToValueAtTime(n.gain, t0 + n.at + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + n.at + n.dur);
      osc.connect(gain).connect(audio.destination);
      osc.start(t0 + n.at);
      osc.stop(t0 + n.at + n.dur + 0.02);
    }
  } catch { /* egal */ }
}

export type Particle = { x: number; y: number; vx: number; vy: number; size: number; rot: number; vr: number; color: string };

/** Startwerte für Konfettiteilchen: aus der Mitte oben nach oben und zur Seite geschossen. */
export function confettiParticles(count: number, width: number, height: number, colors: string[], random: () => number = Math.random): Particle[] {
  return Array.from({ length: count }, () => ({
    x: width / 2 + (random() - 0.5) * width * 0.3,
    y: height * 0.35,
    vx: (random() - 0.5) * 14,
    vy: -(random() * 10 + 6),
    size: random() * 6 + 5,
    rot: random() * Math.PI * 2,
    vr: (random() - 0.5) * 0.4,
    color: colors[Math.floor(random() * colors.length)]!,
  }));
}

const FALLBACK_COLORS = ["#c6f24a", "#8fc22f", "#f0f5e8", "#ffb347", "#ff7a6b"];

function themeColors(): string[] {
  try {
    const css = getComputedStyle(document.documentElement);
    const picked = ["--primary", "--accent", "--foreground", "--destructive"].map((v) => css.getPropertyValue(v).trim()).filter(Boolean);
    return picked.length ? [...picked, ...FALLBACK_COLORS.slice(0, 2)] : FALLBACK_COLORS;
  } catch { return FALLBACK_COLORS; }
}

/** Konfetti über der ganzen Seite. Maximal ~2 Sekunden, danach verschwindet die Zeichenfläche. */
export function confetti(count = 70) {
  if (typeof document === "undefined" || !fxEnabled() || reducedMotion()) return;
  try {
    const canvas = document.createElement("canvas");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth, h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    canvas.setAttribute("aria-hidden", "true");
    canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:60";
    document.body.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx) return void canvas.remove();
    ctx.scale(dpr, dpr);
    const parts = confettiParticles(count, w, h, themeColors());
    const start = performance.now();
    const frame = (now: number) => {
      const t = now - start;
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.vy += 0.35; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - t / 1900);
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }
      if (t < 1900) requestAnimationFrame(frame); else canvas.remove();
    };
    requestAnimationFrame(frame);
  } catch { /* egal */ }
}

/** Ein Aufruf für Vibration, Ton und Konfetti passend zum Ereignis. */
export function feedback(kind: FxKind, opts: { sound?: boolean; confettiCount?: number } = {}) {
  const { sound = true, confettiCount } = opts;
  haptic(kind);
  if (sound && kind !== "skip") sfx(kind);
  const count = confettiCount ?? (kind === "win" ? 160 : kind === "right" ? 40 : 0);
  if ((kind === "right" || kind === "win") && count > 0) confetti(count);
}
