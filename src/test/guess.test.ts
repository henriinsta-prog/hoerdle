import { describe, expect, it } from "vitest";
import { isCorrect, normalize, suggest, uniqueMemes, pickRun, replacementFor, LEVELS } from "@/lib/memes";

const meme = { name: "Penélope Cruz", yt: "aaaaaaaaaaa", aliases: ["penelope"] };

describe("Antwort-Erkennung", () => {
  it("ignoriert Groß-/Kleinschreibung, Akzente und Satzzeichen", () => {
    expect(isCorrect("PENELOPE CRUZ", meme)).toBe(true);
    expect(isCorrect("  penélope   cruz! ", meme)).toBe(true);
    expect(isCorrect("Penelope", meme)).toBe(true);
    expect(normalize("Straße – Müller")).toBe("strasse muller");
  });

  it("lehnt leere und falsche Eingaben ab", () => {
    expect(isCorrect("", meme)).toBe(false);
    expect(isCorrect("???", meme)).toBe(false);
    expect(isCorrect("Cruz Penelope", meme)).toBe(false);
  });
});

describe("Vorschläge", () => {
  const all = uniqueMemes(LEVELS);

  it("findet Treffer im Namen und in Aliassen, Namen zuerst", () => {
    expect(suggest("karsten", all)[0]?.name).toBe("Was ist denn mit Karsten los");
    expect(suggest("trapattoni", all).map((m) => m.name)).toContain("Flasche leer – Ich habe fertig");
  });

  it("liefert bei leerer Eingabe nichts und begrenzt die Anzahl", () => {
    expect(suggest("  ", all)).toEqual([]);
    expect(suggest("e", all).length).toBeLessThanOrEqual(6);
  });
});

describe("Meme-Katalog", () => {
  it("hat fünf Stufen mit unterschiedlichen Memes und gültigen YouTube-IDs", () => {
    expect(LEVELS).toHaveLength(5);
    const all = uniqueMemes(LEVELS);
    expect(all).toHaveLength(37);
    expect(new Set(all.map((m) => m.yt)).size).toBe(all.length);
    expect(new Set(all.map((m) => m.name)).size).toBe(all.length);
    for (const m of all) expect(m.yt).toMatch(/^[\w-]{11}$/);
  });

  it("legt die bekanntesten Memes in die schwersten Stufen", () => {
    const names = (i: number) => LEVELS[i]!.map((m) => m.name);
    for (const n of ["Rickroll", "Was guckst du?", "Flasche leer – Ich habe fertig"]) expect(names(4)).toContain(n);
    expect(names(3)).toContain("Marcell D'Avis 1&1");
  });
});

describe("Speziellere Memes", () => {
  const niche = ["Henri Henrisson", "Dominika – Nicht schnell, langsam", "Swear to God", "Ich hab Polizei", "Verpiss dich du Huso", "Du hast Madeira-Verbot"];
  const names = (i: number) => LEVELS[i]!.map((m) => m.name);

  it("sind wieder im Spiel, aber nur in Stufe 2 und 3", () => {
    for (const n of niche) {
      expect(names(1)).toContain(n);
      expect(names(2)).toContain(n);
      expect(names(0)).not.toContain(n);
      expect(names(3)).not.toContain(n);
      expect(names(4)).not.toContain(n);
    }
  });

  it("zieht pro Runde nie dasselbe Meme zweimal, obwohl Stufen sich Pools teilen", () => {
    for (let i = 0; i < 300; i++) expect(new Set(pickRun(LEVELS, "t").map((m) => m.yt)).size).toBe(5);
  });
});

describe("Kaputte Clips", () => {
  const m = (n: string, yt: string) => ({ name: n, yt });
  const pool = [m("A", "aaaaaaaaaaa"), m("B", "bbbbbbbbbbb"), m("C", "ccccccccccc"), m("D", "ddddddddddd")];

  it("ersetzt durch ein Meme der Stufe, das weder in der Runde noch als kaputt bekannt ist", () => {
    const run = [pool[0]!, pool[1]!];
    for (let i = 0; i < 50; i++) expect(replacementFor(pool, run, ["ccccccccccc"])?.name).toBe("D");
  });

  it("gibt null zurück, wenn kein Ersatz übrig ist", () => {
    expect(replacementFor(pool, pool.slice(0, 3), ["ddddddddddd"])).toBeNull();
    expect(replacementFor([pool[0]!], [pool[0]!], [])).toBeNull();
  });

  it("zieht bekannte Fehlerclips nicht mehr, solange es Alternativen gibt", () => {
    const store: Record<string, string> = { "hoerdle-broken": JSON.stringify(["aaaaaaaaaaa", "bbbbbbbbbbb"]) };
    const g = globalThis as unknown as { localStorage?: unknown };
    const before = g.localStorage;
    g.localStorage = { getItem: (k: string) => store[k] ?? null, setItem: (k: string, v: string) => { store[k] = v; } };
    try {
      for (let i = 0; i < 100; i++) expect(pickRun([pool, pool], "k").every((x) => x.yt !== "aaaaaaaaaaa" && x.yt !== "bbbbbbbbbbb")).toBe(true);
    } finally {
      g.localStorage = before;
    }
  });
});
