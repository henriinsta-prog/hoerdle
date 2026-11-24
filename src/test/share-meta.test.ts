import { describe, expect, it } from "vitest";
import { parseDuelSearch, searchFromHeadContext, shareMeta } from "@/lib/share-meta";

const base = { title: "Memedle", description: "Basis" };
const get = (meta: Record<string, string>[], key: string, value: string) => meta.find((m) => m[key] === value)?.content;

describe("Vorschau-Meta", () => {
  it("setzt Bild, Größe und Twitter-Karte für jede Seite", () => {
    const meta = shareMeta(base);
    expect(get(meta, "property", "og:image")).toContain("/og-image.png");
    expect(get(meta, "property", "og:image:width")).toBe("1200");
    expect(get(meta, "name", "twitter:image")).toContain("/og-image.png");
    expect(get(meta, "property", "og:title")).toBe("Memedle");
  });

  it("zeigt bei einem Duell-Link die Herausforderung im Titel", () => {
    const meta = shareMeta(base, { duell: "a,b,c,d,e", p: 820, n: "Henri" });
    expect(get(meta, "property", "og:title")).toBe("⚔️ Henri fordert dich heraus – 820 Punkte");
    expect(get(meta, "property", "og:description")).toContain("fünf Sounds");
  });

  it("kommt auch ohne Namen und ohne Punkte zurecht", () => {
    expect(get(shareMeta(base, { duell: "x" }), "property", "og:title")).toBe("⚔️ Dein Freund fordert dich heraus");
    expect(get(shareMeta(base, {}), "property", "og:title")).toBe("Memedle");
  });

  it("prüft Such-Parameter streng", () => {
    expect(parseDuelSearch({ duell: "a,b", p: 820, n: "Henri" })).toEqual({ duell: "a,b", p: 820, n: "Henri" });
    expect(parseDuelSearch({ p: "99999" })).toEqual({});
    expect(parseDuelSearch({ p: -1, n: "  " })).toEqual({ n: undefined });
    expect(parseDuelSearch({ duell: 5, p: "x" })).toEqual({});
    expect(parseDuelSearch({ n: 123 })).toEqual({ n: "123" });
  });

  it("scheitert nicht, wenn der Router-Kontext anders aussieht", () => {
    expect(searchFromHeadContext(undefined)).toBeNull();
    expect(searchFromHeadContext({})).toBeNull();
    expect(searchFromHeadContext({ match: { search: { duell: "a", p: 5 } } })).toEqual({ duell: "a", p: 5 });
  });
});
