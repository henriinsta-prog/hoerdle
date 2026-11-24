import type { Meme } from "./memes";

/** Höchstpunktzahl einer Runde: Stufe n bringt maximal n × 100 Punkte (1–5 → 1500). */
export const MAX_SCORE = 1500;

/** Angaben des Herausforderers, die im Duell-Link mitreisen. */
export type ChallengerInfo = { score: number; name?: string };

export function challengeFromSearch(levels: Meme[][], search: string): Meme[] | null {
  const ids = new URLSearchParams(search).get("duell")?.split(",");
  if (!ids || ids.length !== levels.length) return null;

  const run = ids.map((id, index) => levels[index]?.find((meme) => meme.yt === id));
  return run.every((meme): meme is Meme => Boolean(meme)) ? run : null;
}

/** Bereinigt einen Spielernamen: keine Steuerzeichen, höchstens 20 Zeichen. */
export function cleanName(raw: string | null | undefined): string | undefined {
  const name = (raw ?? "").replace(/[\u0000-\u001f\u007f<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 20);
  return name || undefined;
}

/** Liest Punktestand und Namen des Herausforderers; ungültige Werte werden verworfen. */
export function challengerFromSearch(search: string): ChallengerInfo | null {
  const params = new URLSearchParams(search);
  const raw = params.get("p");
  if (raw === null || !/^\d{1,4}$/.test(raw)) return null;
  const score = Number(raw);
  if (score > MAX_SCORE) return null;
  return { score, name: cleanName(params.get("n")) };
}

export function createChallengeUrl(origin: string, pathname: string, run: Meme[], challenger?: ChallengerInfo) {
  let url = `${origin}${pathname}?duell=${run.map((meme) => meme.yt).join(",")}`;
  if (challenger) {
    url += `&p=${Math.max(0, Math.min(MAX_SCORE, Math.round(challenger.score)))}`;
    const name = cleanName(challenger.name);
    if (name) url += `&n=${encodeURIComponent(name)}`;
  }
  return url;
}

export type DuelOutcome = "win" | "lose" | "draw";

export function duelOutcome(mine: number, theirs: number): DuelOutcome {
  return mine > theirs ? "win" : mine < theirs ? "lose" : "draw";
}
