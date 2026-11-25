export type Meme = { name: string; yt: string; start?: number; aliases?: string[] };

/**
 * Memes pro Schwierigkeitsstufe (Index 0 = Stufe 1).
 * Die Schwierigkeit entsteht über die Clip-Länge. Stufe 1 nutzt nur breit bekannte Memes (EASY_POOL),
 * Stufe 2 und 3 zusätzlich speziellere aus der Netzkultur (NICHE und NEW), Stufe 4 und 5 die
 * in Deutschland bekanntesten. Als Antwort gilt der bekannteste Name des Memes, der alte Name bleibt Alias.
 * Startsekunden (`start`) und Videolängen sind von Hand geprüft.
 */
const EASY_POOL: Meme[] = [
    { name: "Nicht so tief Rüdiger", yt: "m-5m8wGDcSo", aliases: ["rüdiger", "keine kapriolen"] },
    { name: "Wolfgang pass auf", yt: "ItqQ2EZziB8", start: 6, aliases: ["wolfgang", "reifen"] },
    { name: "Kranplätze müssen verdichtet sein", yt: "Ccll1mKk_3w", aliases: ["kranplätze", "ronny"] },
    { name: "Big Tasty Kritiker", yt: "dhETW09NFDk", start: 2, aliases: ["big tasty"] },
    { name: "Kokosmilch", yt: "MSRKOhcxnow", aliases: ["oma will cola zerrro", "oma will cola zero", "cola zero", "zerrro", "oma"] },
    { name: "Michi bringt das Bier", yt: "52lc3IjWIAs", aliases: ["michi", "ey das ist kaputt"] },
    { name: "Was ist denn mit Karsten los", yt: "PeETF41yXbo", aliases: ["karsten"] },
    { name: "Was ist das für 1 Kombi", yt: "q2yHcQuP2q4", start: 25, aliases: ["kombi"] },
    { name: "Warum liegt hier überhaupt Stroh", yt: "J2ShLsJYWe8", aliases: ["stroh"] },
    { name: "Europa ist ein Land", yt: "ktFTKVf2OKo", aliases: ["unge", "europa"] },
    { name: "Migrationshintergrund? Weiße Wand", yt: "l2rMlFXXsvU", aliases: ["migrationshintergrund", "weiße wand"] },
];
const NICHE: Meme[] = [
    { name: "Henri Henrisson", yt: "Yx0Z-mKkIvI", aliases: ["jürgen hurenson", "isländer"] },
    { name: "Dominika – Nicht schnell, langsam", yt: "2uhvWHPmitY", aliases: ["dominika", "nicht schnell", "richard steht hoch"] },
    { name: "Sag wallah", yt: "m0gbLf04dOk", aliases: ["swear to god", "trymacs", "wallah"] },
    { name: "Du hast Madeira-Verbot", yt: "d0wnzgaGqNo", start: 4, aliases: ["madeira", "madeira verbot", "unge"] },
];
/** Weitere bekannte Memes aus der Netzkultur, in Stufe 2 und 3 (und im Blitz-Modus) */
const NEW: Meme[] = [
    { name: "Chantal, heul leise", yt: "SxuQprBbzpo", aliases: ["chantal", "heul leise", "fack ju göhte"] },
    { name: "Bitte helfen Sie mir, ich bin in Gefahr", yt: "6zswl5YrvVw", start: 7, aliases: ["ich bin in gefahr", "bitte helfen sie mir", "helfen sie mir"] },
    { name: "Ich machen so, Auto machen so", yt: "7eQfJBDiwrA", start: 11, aliases: ["auto machen so", "unfall", "ich machen so", "a20"] },
    { name: "Zijaretten", yt: "EqekSuj5HCo", start: 14, aliases: ["zigaretten", "walter frosch", "frosch"] },
    { name: "Einfach Orangensaft", yt: "G4cOjG8O-j0", start: 9, aliases: ["orangensaft", "money boy"] },
    { name: "Meine Chicken Nuggets verbrennen", yt: "EQawYBnMORw", start: 6, aliases: ["chicken nuggets", "nuggets", "nooreax"] },
    { name: "Forza ist fertig runtergeladen", yt: "lv-mD3qtalw", start: 10, aliases: ["forza", "fertig runtergeladen", "drachenlord forza"] },
    { name: "Frohes Schaffen", yt: "bZ-cuF30rQ8", aliases: ["schönen abend noch", "drehscheibe"] },
    { name: "Beste deutsche Mountainbikerin", yt: "TbQogqoOr0E", start: 4, aliases: ["mountainbikerin", "regina stiefl", "regina stiefel"] },
    { name: "Die haben mich von meinem 12-jährigen Sohn entfernt", yt: "4rKcjRjoWZk", aliases: ["12 jährigen sohn", "zwölfjährigen sohn", "sohn entfernt", "sohn"] },
    // Aus einem Zusammenschnitt-Video (Startsekunden von Hand geprüft)
    { name: "Woran hat's gelegen", yt: "9NyJTkuc4zg", start: 20, aliases: ["woran hat es gelegen", "woran hats gelegen", "woran hat et gelegen"] },
    { name: "Bonbon", yt: "9NyJTkuc4zg", start: 135, aliases: ["bonbons"] },
    { name: "PC Crashout", yt: "9NyJTkuc4zg", start: 185, aliases: ["pc crash out", "crashout", "pc crash"] },
    { name: "Ultimativer Trick", yt: "9NyJTkuc4zg", start: 207, aliases: ["trick"] },
    { name: "Konnichiwa", yt: "9NyJTkuc4zg", start: 242, aliases: ["konichiwa", "konnichiva"] },
    { name: "Mach das alles sofort aus", yt: "9NyJTkuc4zg", start: 272, aliases: ["mach das aus", "sofort aus", "mach alles aus"] },
    { name: "Schalke Platzierung", yt: "9NyJTkuc4zg", start: 345, aliases: ["schalke", "schalke plazierung", "tabellenplatz"] },
    { name: "Onkelfickerberg", yt: "eddKYpK83m4", aliases: [] },
];
/** Zwei weitere Memes aus einem anderen Zusammenschnitt-Video (je eines in Stufe 2 und 3) */
const ERSTER_GETOETET: Meme = { name: "Natürlich werde ich als erster getötet", yt: "VdUlXIi8VhA", start: 163, aliases: ["als erster getötet", "erster getötet"] };
const NEUE_TASSE: Meme = { name: "Ich hab 'ne neue Tasse", yt: "VdUlXIi8VhA", start: 201, aliases: ["neue tasse", "tasse"] };
/** Kurze Clips (je etwa 6 bis 9 Sekunden): nur in den Stufen mit der kürzesten Gesamtlänge */
const SHORT_VIDEOS: Meme[] = [
    { name: "Ich bin der Uwe, und ich bin auch dabei", yt: "9NyJTkuc4zg", start: 169, aliases: ["uwe", "ich bin der uwe", "auch dabei", "uwe ist auch dabei"] },
    { name: "Cabonat Erol", yt: "9NyJTkuc4zg", start: 200, aliases: ["cabonat", "erol", "carbonat erol"] },
    { name: "Pizza Peperoni", yt: "9NyJTkuc4zg", start: 433, aliases: ["peperoni", "pizza"] },
    { name: "Tut ein bisschen weh, machen lieber nicht wieder", yt: "9NyJTkuc4zg", start: 456, aliases: ["tut ein bisschen weh", "machen lieber nicht wieder", "tut ein bisschen weh machen lieber nicht"] },
    { name: "Ich habe nur ein Bier getrunken", yt: "k29dop29raQ", aliases: ["nur ein bier", "1 bier"] },
    { name: "Halt Stop, jetzt rede ich", yt: "39tK5DL1z28", aliases: ["halt stop", "halt stopp", "andreas"] },
];

export const LEVELS: Meme[][] = [
  EASY_POOL,
  [...EASY_POOL, ...NICHE, ...NEW, ERSTER_GETOETET],
  [...EASY_POOL, ...NICHE, ...NEW, NEUE_TASSE],
  [
    { name: "Marcell D'Avis 1&1", yt: "7dOIJbnPoXo", aliases: ["marcel davis", "marcell davis", "1und1"] },
    { name: "Habicht hat zwei H", yt: "2wiFX31VCQs", aliases: ["habicht", "9live"] },
    { name: "Layla", yt: "laru0QoJUmI", aliases: ["dj robin", "schürze"] },
    { name: "Ich muss raus", yt: "GIoeXtH4keg", aliases: ["bus kid"] },
    { name: "Sie haben mich ins Gesicht gefilmt", yt: "3O-RygMZ88c", aliases: ["hutbürger", "ins gesicht gefilmt"] },
    ...SHORT_VIDEOS,
  ],
  [
    { name: "Rickroll", yt: "dQw4w9WgXcQ", aliases: ["never gonna give you up"] },
    { name: "Was guckst du?", yt: "uZox54DnTAw", aliases: ["was guckst du", "kaya yanar"] },
    { name: "Flasche leer – Ich habe fertig", yt: "ub1zsUD7UNQ", start: 81, aliases: ["trapattoni", "flasche leer", "ich habe fertig"] },
    { name: "Das Internet ist für uns alle Neuland", yt: "D-EUytbzO5Y", aliases: ["neuland", "merkel"] },
    { name: "Stromberg – Das Leben ist kein Ponyhof", yt: "BMsm8_YOn1o", start: 24, aliases: ["stromberg", "ponyhof"] },
    { name: "Nein! Doch! Oh!", yt: "w4aLThuU008", aliases: ["nein doch oh", "louis de funes"] },
    { name: "Was machen Sachen", yt: "afhOpXMllH0", start: 1, aliases: ["tv total"] },
    { name: "Timghio ist vierter", yt: "VdUlXIi8VhA", start: 4, aliases: ["timghio", "tim ghio"] },
    ...SHORT_VIDEOS,
  ],
];
export const MEMES: Meme[] = uniqueMemes(LEVELS);
export const LEVEL_NAMES = ["Sehr leicht", "Leicht", "Mittel", "Schwer", "Extrem"];

/** Sekunden pro Versuch, je Stufe kürzer */
export const LEVEL_CLIPS: number[][] = [
  [1, 2, 4, 7, 11, 16],
  [0.75, 1.5, 3, 5, 8, 12],
  [0.5, 1, 2, 4, 7, 12],
  [0.3, 0.6, 1.2, 2.5, 5, 9],
  [0.15, 0.3, 0.6, 1.2, 2.5, 5],
];

/** Punkte: 0 wenn nicht erraten, sonst mehr für weniger Versuche und höhere Stufe */
export function points(level: number, attempts: number, won: boolean) {
  if (!won) return 0;
  return Math.round(((7 - attempts) / 6) * 100 * (level + 1));
}

export function rank(total: number) {
  if (total >= 1200) return "Deutscher Meme-Gott 👑";
  if (total >= 800) return "Ehrenmann 🤝";
  if (total >= 400) return "Meme-Kenner 😎";
  if (total > 0) return "Gelegenheits-Scroller 📱";
  return "Meme-NPC 🤖";
}

const BROKEN_KEY = "hoerdle-broken";

/** IDs von Clips, die in diesem Browser nicht abspielbar waren (gelöscht, gesperrt, Region) */
export function readBroken(): string[] {
  try { return JSON.parse(localStorage.getItem(BROKEN_KEY) ?? "[]"); } catch { return []; }
}

export function markBroken(id: string) {
  try {
    const broken = readBroken();
    if (!broken.includes(id)) localStorage.setItem(BROKEN_KEY, JSON.stringify([...broken, id]));
  } catch { /* ohne Speicher geht es auch */ }
}

/** Ersatz für einen nicht abspielbaren Clip: ein anderes Meme der Stufe, das noch nicht in der Runde ist */
export function replacementFor(pool: Meme[], run: Meme[], broken: string[], random: () => number = Math.random): Meme | null {
  const inRun = new Set(run.map(memeId));
  const bad = new Set(broken);
  const options = pool.filter((m) => !inRun.has(memeId(m)) && !bad.has(m.yt));
  return options.length ? options[Math.floor(random() * options.length)]! : null;
}

/** Wählt pro Stufe ein Meme, bevorzugt solche, die zuletzt nicht dran waren, nie zweimal dasselbe pro Runde und möglichst keine bekannten Fehlerclips */
export function pickRun(levels: Meme[][] = LEVELS, key = "memedle-seen"): Meme[] {
  let seen: string[] = [];
  try { seen = JSON.parse(localStorage.getItem(key) ?? "[]"); } catch {}
  const broken = readBroken();
  const chosen = new Set<string>();
  const run = levels.map((all) => {
    const l = all.filter((m) => !broken.includes(m.yt)).length >= 1 ? all.filter((m) => !broken.includes(m.yt)) : all;
    let pool = l.filter((m) => !seen.includes(memeId(m)) && !chosen.has(memeId(m)));
    if (!pool.length) {
      seen = seen.filter((id) => !l.some((m) => memeId(m) === id));
      pool = l.filter((m) => !chosen.has(memeId(m)));
    }
    if (!pool.length) pool = l;
    const pick = pool[Math.floor(Math.random() * pool.length)]!;
    chosen.add(memeId(pick));
    return pick;
  });
  try { localStorage.setItem(key, JSON.stringify([...seen, ...run.map(memeId)])); } catch {}
  return run;
}

/** Eindeutige Kennung eines Memes: Video-ID, bei Startsekunde zusätzlich diese (ein Video kann mehrere Memes enthalten). */
export const memeId = (m: Meme) => (m.start ? `${m.yt}@${m.start}` : m.yt);

/** Findet ein Meme anhand seiner Kennung. Alte Duell-Links mit reiner Video-ID funktionieren weiter. */
export function findById(pool: Meme[] | undefined, id: string): Meme | undefined {
  return pool?.find((m) => memeId(m) === id) ?? pool?.find((m) => m.yt === id);
}

/** Alle Einträge einer Stufenliste ohne Doppelte (für Vorschläge, wenn Stufen sich einen Pool teilen) */
export function uniqueMemes(levels: Meme[][]): Meme[] {
  // Schlüssel: Video und Startsekunde, denn ein Zusammenschnitt-Video kann mehrere Memes enthalten
  return [...new Map(levels.flat().map((m) => [`${m.yt}@${m.start ?? 0}`, m])).values()];
}

/** Vergleichsform: Kleinschreibung, ohne Akzente/Umlaut-Punkte und Satzzeichen */
export const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export const isCorrect = (guess: string, m: Meme) => {
  const g = normalize(guess);
  return g !== "" && [m.name, ...(m.aliases ?? [])].some((x) => normalize(x) === g);
};

/** Vorschläge für das Eingabefeld: Treffer im Namen oder in einem Alias, Namen zuerst */
export function suggest(input: string, memes: Meme[], limit = 6): Meme[] {
  const q = normalize(input);
  if (!q) return [];
  const byName = memes.filter((m) => normalize(m.name).includes(q));
  const byAlias = memes.filter((m) => !byName.includes(m) && (m.aliases ?? []).some((a) => normalize(a).includes(q)));
  return [...byName, ...byAlias].slice(0, limit);
}
