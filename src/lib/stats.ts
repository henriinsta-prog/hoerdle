import { MAX_SCORE } from "./challenge";

/** Eine gespielte Runde. `attempts[i]` = Versuche bis zur Lösung der Stufe i+1 (1–6) oder null, wenn nicht gelöst. */
export type RoundRecord = { t: number; score: number; attempts: (number | null)[] };

export const MAX_ROUNDS = 100;
export const LEVEL_COUNT = 5;

export const statsKey = (storageKey: string) => `${storageKey}-stats`;

const validAttempt = (x: unknown): x is number | null => x === null || (Number.isInteger(x) && (x as number) >= 1 && (x as number) <= 6);

/** Bereinigt gespeicherte Daten: kaputte Einträge werden verworfen, nie geworfen. */
export function sanitizeRounds(raw: unknown): RoundRecord[] {
  if (!Array.isArray(raw)) return [];
  const out: RoundRecord[] = [];
  for (const r of raw) {
    if (!r || typeof r !== "object") continue;
    const { t, score, attempts } = r as Record<string, unknown>;
    if (typeof t !== "number" || !Number.isFinite(t)) continue;
    if (!Number.isInteger(score) || (score as number) < 0 || (score as number) > MAX_SCORE) continue;
    if (!Array.isArray(attempts) || attempts.length !== LEVEL_COUNT || !attempts.every(validAttempt)) continue;
    out.push({ t, score: score as number, attempts: attempts as (number | null)[] });
  }
  return out.slice(-MAX_ROUNDS);
}

export function loadRounds(key: string): RoundRecord[] {
  try { return sanitizeRounds(JSON.parse(localStorage.getItem(key) ?? "[]")); } catch { return []; }
}

export function saveRounds(key: string, rounds: RoundRecord[]) {
  try { localStorage.setItem(key, JSON.stringify(rounds)); } catch { /* ohne Speicher geht es auch */ }
}

export const addRound = (rounds: RoundRecord[], rec: RoundRecord): RoundRecord[] => [...rounds, rec].slice(-MAX_ROUNDS);

/** Neuer Rekord = besser als alles Bisherige. Die allererste Runde zählt nicht. */
export const isNewRecord = (previous: RoundRecord[], score: number) => previous.length > 0 && score > Math.max(...previous.map((r) => r.score));

export type Summary = {
  played: number;
  best: number;
  /** Durchschnitt der letzten 10 Runden, gerundet */
  avgLast10: number;
  /** distribution[i] = Stufen, die mit i+1 Versuchen gelöst wurden */
  distribution: number[];
  unsolved: number;
};

export function summarize(rounds: RoundRecord[]): Summary {
  const last10 = rounds.slice(-10);
  const distribution = [0, 0, 0, 0, 0, 0];
  let unsolved = 0;
  for (const r of rounds) for (const a of r.attempts) { if (a === null) unsolved++; else distribution[a - 1]!++; }
  return {
    played: rounds.length,
    best: rounds.length ? Math.max(...rounds.map((r) => r.score)) : 0,
    avgLast10: last10.length ? Math.round(last10.reduce((s, r) => s + r.score, 0) / last10.length) : 0,
    distribution,
    unsolved,
  };
}
