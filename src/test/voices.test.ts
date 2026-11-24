import { describe, expect, it } from "vitest";
import { VOICES, VOICE_CLIPS, VOICE_LEVELS } from "@/lib/voices";
import { pickRun, uniqueMemes } from "@/lib/memes";
import { resultGrid } from "@/lib/result-share";

describe("Stimmdle-Katalog", () => {
  it("nutzt einen gemeinsamen Pool aus unterschiedlichen Schauspielern für alle fünf Stufen", () => {
    expect(VOICE_LEVELS).toHaveLength(5);
    for (const level of VOICE_LEVELS) expect(level).toBe(VOICES);
    expect(VOICES.length).toBeGreaterThanOrEqual(40);
    expect(new Set(VOICES.map((v) => v.name)).size).toBe(VOICES.length);
    expect(new Set(VOICES.map((v) => v.yt)).size).toBe(VOICES.length);
    expect(uniqueMemes(VOICE_LEVELS)).toHaveLength(VOICES.length);
  });

  it("enthält keine in Deutschland kaum bekannten Schauspieler mehr", () => {
    const names = VOICES.map((v) => v.name);
    for (const gone of ["Alan Arkin", "Jim Broadbent", "Chris Cooper", "Mark Rylance", "Allison Janney", "Regina King", "Ariana DeBose", "Da'Vine Joy Randolph", "Alicia Vikander", "Patricia Arquette"]) {
      expect(names).not.toContain(gone);
    }
    for (const stay of ["Morgan Freeman", "Leonardo DiCaprio", "Emma Stone", "Jamie Foxx", "Zoe Saldaña"]) expect(names).toContain(stay);
  });

  it("enthält die geprüften deutschen Schauspieler mit ihrer Startsekunde", () => {
    const by = (n: string) => VOICES.find((v) => v.name === n);
    expect(by("Elyas M'Barek")?.start).toBe(32);
    expect(by("Karoline Herfurth")?.start).toBe(91);
    expect(by("Nora Tschirner")?.start).toBe(88);
    expect(by("Heike Makatsch")?.start).toBe(20);
    for (const missing of ["Til Schweiger", "Daniel Brühl", "Iris Berben", "Diane Kruger"]) expect(by(missing)).toBeUndefined();
    expect(VOICES.length).toBe(61);
  });

  it("startet jede Passage an einer festgelegten Stelle", () => {
    for (const voice of VOICES) {
      expect(voice.start).toBeGreaterThanOrEqual(0);
      expect(voice.yt).toMatch(/^[\w-]{11}$/);
    }
  });
});

describe("Zeitschritte der Stimmen", () => {
  it("hat pro Stufe sechs wachsende Schritte, und Stufe 5 beginnt bei 0,1 Sekunden", () => {
    expect(VOICE_CLIPS).toHaveLength(5);
    expect(VOICE_CLIPS[4]![0]).toBe(0.1);
    for (const clips of VOICE_CLIPS) {
      expect(clips).toHaveLength(6);
      clips.slice(1).forEach((c, i) => expect(c).toBeGreaterThan(clips[i]!));
    }
  });

  it("wird von Stufe zu Stufe schwerer: kürzerer Start und kürzeres Ende", () => {
    for (let i = 1; i < 5; i++) {
      expect(VOICE_CLIPS[i]![0]).toBeLessThan(VOICE_CLIPS[i - 1]![0]!);
      expect(VOICE_CLIPS[i]![5]).toBeLessThan(VOICE_CLIPS[i - 1]![5]!);
    }
  });
});

describe("Rundenauswahl", () => {
  it("zieht pro Runde nie zweimal denselben Schauspieler, auch bei gemeinsamem Pool", () => {
    for (let i = 0; i < 300; i++) {
      const run = pickRun(VOICE_LEVELS, "test-key");
      expect(run).toHaveLength(5);
      expect(new Set(run.map((m) => m.yt)).size).toBe(5);
    }
  });
});

describe("teilbares Ergebnismuster", () => {
  it("markiert den richtigen Versuch grün und lässt Restfelder dunkel", () => {
    expect(resultGrid([{ kinds: ["wrong", "skip", "right"] }])).toEqual(["🟥⬜🟩⬛⬛⬛"]);
  });

  it("markiert eine verlorene Runde ohne grünes Feld", () => {
    const kinds = ["wrong", "skip", "wrong", "skip", "wrong", "wrong"] as const;
    expect(resultGrid([{ kinds: [...kinds] }])).toEqual(["🟥⬜🟥⬜🟥🟥"]);
  });
});
