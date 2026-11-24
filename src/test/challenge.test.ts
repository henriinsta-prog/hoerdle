import { describe, expect, it } from "vitest";
import { challengeFromSearch, challengerFromSearch, cleanName, createChallengeUrl, duelOutcome } from "@/lib/challenge";
import type { Meme } from "@/lib/memes";

const levels: Meme[][] = [
  [{ name: "Erstes A", yt: "aaaaaaaaaaa" }, { name: "Erstes B", yt: "bbbbbbbbbbb" }],
  [{ name: "Zweites A", yt: "ccccccccccc" }, { name: "Zweites B", yt: "ddddddddddd" }],
];

describe("Duell-Links", () => {
  it("spielt bei einem gültigen Link exakt dieselben Clips in derselben Reihenfolge", () => {
    const run = challengeFromSearch(levels, "?duell=bbbbbbbbbbb,ccccccccccc");
    expect(run?.map((meme) => meme.name)).toEqual(["Erstes B", "Zweites A"]);
  });

  it("verwirft falsche Stufen oder unbekannte Videos", () => {
    expect(challengeFromSearch(levels, "?duell=bbbbbbbbbbb")).toBeNull();
    expect(challengeFromSearch(levels, "?duell=bbbbbbbbbbb,xxxxxxxxxxx")).toBeNull();
  });

  it("erstellt einen Link mit allen Clips der gespielten Runde", () => {
    const run = [levels[0]![1]!, levels[1]![0]!];
    expect(createChallengeUrl("https://hoerdle.de", "/stimmen", run)).toBe(
      "https://hoerdle.de/stimmen?duell=bbbbbbbbbbb,ccccccccccc",
    );
  });
});

describe("Duell mit Punktestand", () => {
  const run = [levels[0]![1]!, levels[1]![0]!];

  it("hängt Punkte und Namen des Herausforderers an den Link", () => {
    expect(createChallengeUrl("https://hoerdle.de", "/memes", run, { score: 820, name: "Henri" })).toBe(
      "https://hoerdle.de/memes?duell=bbbbbbbbbbb,ccccccccccc&p=820&n=Henri",
    );
  });

  it("liest Punkte und Namen wieder aus dem Link", () => {
    expect(challengerFromSearch("?duell=x&p=820&n=Henri")).toEqual({ score: 820, name: "Henri" });
    expect(challengerFromSearch("?duell=x&p=0")).toEqual({ score: 0, name: undefined });
  });

  it("verwirft ungültige Punktzahlen", () => {
    expect(challengerFromSearch("?duell=x")).toBeNull();
    expect(challengerFromSearch("?p=-5")).toBeNull();
    expect(challengerFromSearch("?p=abc")).toBeNull();
    expect(challengerFromSearch("?p=1501")).toBeNull();
    expect(challengerFromSearch("?p=99999")).toBeNull();
  });

  it("bereinigt Namen", () => {
    expect(cleanName("  Hen\u0000ri <b>  ")).toBe("Henri b");
    expect(cleanName("x".repeat(50))).toHaveLength(20);
    expect(cleanName("   ")).toBeUndefined();
  });

  it("bestimmt Sieger, Verlierer und Unentschieden", () => {
    expect(duelOutcome(500, 400)).toBe("win");
    expect(duelOutcome(300, 400)).toBe("lose");
    expect(duelOutcome(400, 400)).toBe("draw");
  });
});
