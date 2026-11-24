import { describe, expect, it } from "vitest";
import { MAX_ROUNDS, addRound, isNewRecord, sanitizeRounds, statsKey, summarize, type RoundRecord } from "@/lib/stats";

const round = (score: number, attempts: (number | null)[] = [1, 2, 3, null, 6], t = 1): RoundRecord => ({ t, score, attempts });

describe("Statistik", () => {
  it("fasst Rekord, Durchschnitt der letzten 10 und Verteilung zusammen", () => {
    const rounds = [round(300), round(900, [1, 1, 1, 1, 1]), round(600, [2, null, null, null, null])];
    expect(summarize(rounds)).toEqual({ played: 3, best: 900, avgLast10: 600, distribution: [6, 2, 1, 0, 0, 1], unsolved: 5 });
  });

  it("rechnet den Durchschnitt nur über die letzten 10 Runden", () => {
    const rounds = [...Array.from({ length: 5 }, () => round(1000)), ...Array.from({ length: 10 }, () => round(100))];
    expect(summarize(rounds).avgLast10).toBe(100);
  });

  it("kommt mit leeren Daten zurecht", () => {
    expect(summarize([])).toEqual({ played: 0, best: 0, avgLast10: 0, distribution: [0, 0, 0, 0, 0, 0], unsolved: 0 });
  });

  it("erkennt neue Rekorde, die erste Runde zählt nicht", () => {
    expect(isNewRecord([], 500)).toBe(false);
    expect(isNewRecord([round(400)], 500)).toBe(true);
    expect(isNewRecord([round(500)], 500)).toBe(false);
    expect(isNewRecord([round(900), round(100)], 800)).toBe(false);
  });

  it("speichert höchstens die letzten 100 Runden", () => {
    let rounds: RoundRecord[] = [];
    for (let i = 0; i < MAX_ROUNDS + 20; i++) rounds = addRound(rounds, round(i, undefined, i));
    expect(rounds).toHaveLength(MAX_ROUNDS);
    expect(rounds[0]!.t).toBe(20);
  });

  it("verwirft kaputte gespeicherte Einträge, statt zu scheitern", () => {
    const good = round(500);
    expect(sanitizeRounds([good, null, "x", { t: 1, score: -5, attempts: [1, 1, 1, 1, 1] }, { t: 1, score: 99999, attempts: [1, 1, 1, 1, 1] },
      { t: 1, score: 5, attempts: [1, 2, 3] }, { t: 1, score: 5, attempts: [1, 2, 3, 4, 7] }, { t: "a", score: 5, attempts: [1, 1, 1, 1, 1] }])).toEqual([good]);
    expect(sanitizeRounds("kaputt")).toEqual([]);
    expect(sanitizeRounds(undefined)).toEqual([]);
  });

  it("trennt die Statistik je Spiel", () => {
    expect(statsKey("memedle-seen")).not.toBe(statsKey("stimmdle-seen"));
  });
});
