/** Serie: an wie vielen Tagen in Folge mindestens eine Runde gespielt wurde. Liegt nur im Browser. */
export const STREAK_KEY = "hoerdle-streak";

export type Streak = { last: string; count: number; best: number };

/** Kalendertag im lokalen Zeitraum, z. B. "2026-11-25" */
export function dayKey(d: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** Anzahl Kalendertage zwischen zwei Tagesschlüsseln (unabhängig von Sommerzeit) */
export function daysBetween(from: string, to: string): number {
  const t = (s: string) => {
    const [y, m, d] = s.split("-").map(Number);
    return Date.UTC(y!, m! - 1, d!);
  };
  return Math.round((t(to) - t(from)) / 86_400_000);
}

const VALID_DAY = /^\d{4}-\d{2}-\d{2}$/;

/** Gespeicherte Daten prüfen, damit kaputte Werte die Seite nie stören */
export function sanitizeStreak(raw: unknown): Streak | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;
  if (typeof s.last !== "string" || !VALID_DAY.test(s.last)) return null;
  const count = Number(s.count), best = Number(s.best);
  if (!Number.isInteger(count) || count < 1 || !Number.isInteger(best) || best < count) return null;
  return { last: s.last, count, best };
}

/** Neuer Stand, wenn heute gespielt wurde */
export function nextStreak(prev: Streak | null, today: string): Streak {
  if (!prev) return { last: today, count: 1, best: 1 };
  const gap = daysBetween(prev.last, today);
  if (gap === 0) return prev;
  const count = gap === 1 ? prev.count + 1 : 1; // Lücke (oder Datum zurückgestellt): neu anfangen
  return { last: today, count, best: Math.max(prev.best, count) };
}

/** Wie lang die Serie jetzt zählt: noch gültig, wenn zuletzt heute oder gestern gespielt wurde */
export function activeCount(s: Streak | null, today: string): number {
  if (!s) return 0;
  const gap = daysBetween(s.last, today);
  return gap === 0 || gap === 1 ? s.count : 0;
}

export function loadStreak(): Streak | null {
  try { return sanitizeStreak(JSON.parse(localStorage.getItem(STREAK_KEY) ?? "null")); } catch { return null; }
}

/** Beim Rundenende aufrufen */
export function recordPlay(now: Date = new Date()): Streak {
  const updated = nextStreak(loadStreak(), dayKey(now));
  try { localStorage.setItem(STREAK_KEY, JSON.stringify(updated)); } catch { /* ohne Speicher geht es auch */ }
  return updated;
}
