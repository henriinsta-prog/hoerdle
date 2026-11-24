import { describe, expect, it } from "vitest";
import { BLITZ_CLIPS, blitzBest, blitzRank, blitzShareText, clipSeconds, drawNext, isNewBlitzRecord, pointsFor, sanitizeBlitz } from "@/lib/blitz";
import { SFX, HAPTIC, confettiParticles } from "@/lib/fx";

const m = (n: string, yt: string) => ({ name: n, yt });
const pool = [m("A", "aaaaaaaaaaa"), m("B", "bbbbbbbbbbb"), m("C", "ccccccccccc")];

describe("Blitz: Punkte und Länge", () => {
  it("gibt 100 Punkte plus 50 je Treffer in Folge, höchstens +500", () => {
    expect([0, 1, 2, 10, 11, 99].map(pointsFor)).toEqual([100, 150, 200, 600, 600, 600]);
    expect(pointsFor(-3)).toBe(100);
  });

  it("verkürzt den Ausschnitt je Treffer in Folge, aber nie unter das Minimum", () => {
    const c = BLITZ_CLIPS.memes;
    expect([0, 1, 2, 5, 20].map((n) => clipSeconds(c, n))).toEqual([3, 2.7, 2.4, 1.5, 0.8]);
    expect(clipSeconds(BLITZ_CLIPS.stimmen, 0)).toBe(4);
    expect(clipSeconds(BLITZ_CLIPS.stimmen, 50)).toBe(1);
  });

  it("vergibt passende Ränge", () => {
    expect([0, 399, 400, 1000, 2000, 3500].map(blitzRank)).toEqual(["Aufwärmen 🥱", "Aufwärmen 🥱", "Solide ⚡", "Blitzmerker ⚡⚡", "Meme-Maschine 🔥", "Blitz-Gott 👑"]);
  });
});

describe("Blitz: Ziehen", () => {
  it("zieht keinen Clip doppelt, bis der Pool durch ist, dann von vorn", () => {
    let used = new Set<string>();
    const seen: string[] = [];
    for (let i = 0; i < 3; i++) { const d = drawNext(pool, used, []); seen.push(d.meme.yt); used = d.used; }
    expect(new Set(seen).size).toBe(3);
    const again = drawNext(pool, used, []);
    expect(again.used.size).toBe(1);
  });

  it("überspringt kaputte Clips, solange es Alternativen gibt", () => {
    for (let i = 0; i < 50; i++) expect(drawNext(pool, new Set(), ["aaaaaaaaaaa", "bbbbbbbbbbb"]).meme.yt).toBe("ccccccccccc");
    expect(drawNext([pool[0]!], new Set(), ["aaaaaaaaaaa"]).meme.yt).toBe("aaaaaaaaaaa");
  });

  it("verändert die übergebene Menge nicht", () => {
    const used = new Set<string>();
    drawNext(pool, used, []);
    expect(used.size).toBe(0);
  });
});

describe("Blitz: Rekord und Speicher", () => {
  const r = (score: number) => ({ t: 1, score, correct: 3, bestCombo: 2 });

  it("erkennt neue Rekorde, die erste Runde zählt nicht", () => {
    expect(isNewBlitzRecord([], 500)).toBe(false);
    expect(isNewBlitzRecord([r(400)], 500)).toBe(true);
    expect(isNewBlitzRecord([r(900)], 500)).toBe(false);
    expect(blitzBest([r(1), r(7), r(3)])).toBe(7);
    expect(blitzBest([])).toBe(0);
  });

  it("verwirft kaputte gespeicherte Einträge", () => {
    expect(sanitizeBlitz([r(10), null, { t: 1, score: -1, correct: 1, bestCombo: 1 }, { t: 1, score: 5, correct: 9999, bestCombo: 1 }, "x"])).toEqual([r(10)]);
    expect(sanitizeBlitz("kaputt")).toEqual([]);
  });

  it("formuliert den Teilen-Text", () => {
    const t = blitzShareText("Memedle", 1250, 9, 6, "https://x.de/blitz");
    expect(t).toContain("Memedle-Blitz");
    expect(t).toContain("9 erkannt, beste Serie 6");
    expect(t).toContain("https://x.de/blitz");
  });
});

describe("Effekte", () => {
  it("hat für jedes Ereignis Vibrationsmuster und Töne mit sinnvollen Werten", () => {
    for (const k of ["right", "wrong", "skip", "win"] as const) expect(HAPTIC[k].length).toBeGreaterThan(0);
    for (const k of ["right", "wrong", "win"] as const) for (const n of SFX[k]) { expect(n.freq).toBeGreaterThan(100); expect(n.dur).toBeGreaterThan(0); expect(n.gain).toBeLessThanOrEqual(0.2); }
  });

  it("erzeugt Konfettiteilchen im sichtbaren Bereich mit Farben aus der Liste", () => {
    const ps = confettiParticles(50, 400, 800, ["red", "blue"]);
    expect(ps).toHaveLength(50);
    for (const p of ps) { expect(p.x).toBeGreaterThanOrEqual(400 * 0.35); expect(p.x).toBeLessThanOrEqual(400 * 0.65); expect(p.vy).toBeLessThan(0); expect(["red", "blue"]).toContain(p.color); }
  });
});
