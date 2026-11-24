import { MAX_SCORE, cleanName } from "./challenge";
import { OG_IMAGE_PATH, absoluteUrl } from "./site";

/** Such-Parameter eines Duell-Links (?duell=…&p=…&n=…), bereits geprüft. */
export type DuelSearch = { duell?: string; p?: number; n?: string };

/** Lenient: Router liefert Zahlen auch als Zahl zurück, ungültige Werte werden verworfen. */
export function parseDuelSearch(raw: Record<string, unknown>): DuelSearch {
  const out: DuelSearch = {};
  if (typeof raw.duell === "string" && raw.duell.length <= 200) out.duell = raw.duell;
  const p = typeof raw.p === "number" || typeof raw.p === "string" ? Number(raw.p) : NaN;
  if (Number.isInteger(p) && p >= 0 && p <= MAX_SCORE) out.p = p;
  if (typeof raw.n === "string" || typeof raw.n === "number") out.n = cleanName(String(raw.n));
  return out;
}

type Meta = Record<string, string>;

/**
 * Meta-Angaben einer Seite inkl. Vorschaubild. Bei einem Duell-Link steht die Herausforderung
 * im Titel („⚔️ Henri fordert dich heraus – 820 Punkte“), sodass sie schon in der Chat-Vorschau zu sehen ist.
 */
export function shareMeta(base: { title: string; description: string }, search?: DuelSearch | null): Meta[] {
  let title = base.title;
  let description = base.description;
  if (search?.duell) {
    const who = search.n ?? "Dein Freund";
    title = `⚔️ ${who} fordert dich heraus${search.p !== undefined ? ` – ${search.p} Punkte` : ""}`;
    description = "Spiel exakt dieselben fünf Sounds und schlag den Punktestand. Schaffst du mehr?";
  }
  const image = absoluteUrl(OG_IMAGE_PATH);
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:image", content: image },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { property: "og:image:alt", content: "Hördle – Memes und Schauspieler-Stimmen am Sound erraten" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
  ];
}

/** Liest die Such-Parameter aus dem Kontext von `head`, ohne bei Abweichungen zu scheitern. */
export function searchFromHeadContext(ctx: unknown): DuelSearch | null {
  try {
    const search = (ctx as { match?: { search?: Record<string, unknown> } } | undefined)?.match?.search;
    return search ? parseDuelSearch(search) : null;
  } catch {
    return null;
  }
}
