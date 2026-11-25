import { memeId, type Meme } from "./memes";

/** Blitz-Modus: 60 Sekunden, so viele Clips wie möglich. Treffer in Folge bringen Bonuspunkte, machen aber den Ausschnitt kürzer. */

export const BLITZ_SECONDS = 60;
export type BlitzGameKey = "memes" | "stimmen";

export type ClipCurve = { start: number; step: number; min: number };

/** Länge des Ausschnitts in Sekunden: beginnt bei `start`, wird je Treffer in Folge um `step` kürzer, nie unter `min`. */
export const BLITZ_CLIPS: Record<BlitzGameKey, ClipCurve> = {
  memes: { start: 3, step: 0.3, min: 0.8 },
  stimmen: { start: 4, step: 0.4, min: 1 },
};

export const clipSeconds = (curve: ClipCurve, combo: number) => Math.max(curve.min, Math.round((curve.start - curve.step * combo) * 10) / 10);

export const MAX_BONUS_COMBO = 10;

/** `combo` = Treffer in Folge vor diesem. 100 Punkte + 50 je Treffer in Folge, höchstens +500. */
export const pointsFor = (combo: number) => 100 + 50 * Math.min(Math.max(0, combo), MAX_BONUS_COMBO);

/**
 * Zieht das nächste Meme: keins doppelt, keins, das als kaputt bekannt ist. Ist der Pool leer gespielt,
 * beginnt er von vorn. `used` wird nicht verändert, die neue Menge kommt zurück.
 */
export function drawNext(pool: Meme[], used: ReadonlySet<string>, broken: readonly string[] = [], random: () => number = Math.random): { meme: Meme; used: Set<string> } {
  const usable = pool.filter((m) => !broken.includes(m.yt));
  const base = usable.length ? usable : pool;
  let options = base.filter((m) => !used.has(memeId(m)));
  let nextUsed = new Set(used);
  if (!options.length) { options = base; nextUsed = new Set(); }
  const meme = options[Math.floor(random() * options.length)]!;
  nextUsed.add(memeId(meme));
  return { meme, used: nextUsed };
}

export function blitzRank(score: number) {
  if (score >= 3500) return "Blitz-Gott 👑";
  if (score >= 2000) return "Meme-Maschine 🔥";
  if (score >= 1000) return "Blitzmerker ⚡⚡";
  if (score >= 400) return "Solide ⚡";
  return "Aufwärmen 🥱";
}

export function blitzShareText(gameLabel: string, score: number, correct: number, bestCombo: number, url: string) {
  return `⚡ ${gameLabel}-Blitz\n${score.toLocaleString("de-DE")} Punkte in ${BLITZ_SECONDS} Sekunden – ${correct} erkannt, beste Serie ${bestCombo}\n${blitzRank(score)}\n\nSchlag mich:\n${url}`;
}

/** Gespeicherte Blitz-Runden (Rekord, gespielte Runden) */
export type BlitzRecord = { t: number; score: number; correct: number; bestCombo: number };

export const BLITZ_MAX_ROUNDS = 100;
export const blitzKey = (game: BlitzGameKey) => `hoerdle-blitz-${game}`;

const isCount = (x: unknown, max: number): x is number => Number.isInteger(x) && (x as number) >= 0 && (x as number) <= max;

export function sanitizeBlitz(raw: unknown): BlitzRecord[] {
  if (!Array.isArray(raw)) return [];
  const out: BlitzRecord[] = [];
  for (const r of raw) {
    if (!r || typeof r !== "object") continue;
    const { t, score, correct, bestCombo } = r as Record<string, unknown>;
    if (typeof t !== "number" || !Number.isFinite(t) || !isCount(score, 100000) || !isCount(correct, 500) || !isCount(bestCombo, 500)) continue;
    out.push({ t, score, correct, bestCombo });
  }
  return out.slice(-BLITZ_MAX_ROUNDS);
}

export function loadBlitz(game: BlitzGameKey): BlitzRecord[] {
  try { return sanitizeBlitz(JSON.parse(localStorage.getItem(blitzKey(game)) ?? "[]")); } catch { return []; }
}

export function saveBlitz(game: BlitzGameKey, rounds: BlitzRecord[]) {
  try { localStorage.setItem(blitzKey(game), JSON.stringify(rounds.slice(-BLITZ_MAX_ROUNDS))); } catch { /* egal */ }
}

export const blitzBest = (rounds: BlitzRecord[]) => (rounds.length ? Math.max(...rounds.map((r) => r.score)) : 0);

/** Neuer Rekord = besser als alles Bisherige; die erste Runde zählt nicht. */
export const isNewBlitzRecord = (previous: BlitzRecord[], score: number) => previous.length > 0 && score > blitzBest(previous);
