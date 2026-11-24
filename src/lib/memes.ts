export type Meme = { name: string; yt: string; start?: number; aliases?: string[] };

/**
 * Memes pro Schwierigkeitsstufe (Index 0 = Stufe 1).
 * Die Schwierigkeit entsteht über die Clip-Länge. Stufe 1 nutzt nur breit bekannte Memes (EASY_POOL),
 * Stufe 2 und 3 zusätzlich speziellere aus der Netzkultur (NICHE), Stufe 4 und 5 die
 * in Deutschland bekanntesten.
 */
const EASY_POOL: Meme[] = [
    { name: "Nicht so tief Rüdiger", yt: "m-5m8wGDcSo", aliases: ["rüdiger", "keine kapriolen"] },
    { name: "Wolfgang pass auf", yt: "ItqQ2EZziB8", aliases: ["wolfgang", "reifen"] },
    { name: "Kranplätze müssen verdichtet sein", yt: "Ccll1mKk_3w", aliases: ["kranplätze", "ronny"] },
    { name: "Big Tasty Kritiker", yt: "dhETW09NFDk", aliases: ["big tasty"] },
    { name: "Alarm! Alarm!", yt: "xL1_meeP82g", aliases: ["alarm"] },
    { name: "Ich habe nur ein Bier getrunken", yt: "k29dop29raQ", aliases: ["nur ein bier"] },
    { name: "Oma will Cola Zerrro", yt: "MSRKOhcxnow", aliases: ["cola zero", "zerrro"] },
    { name: "Michi bringt das Bier", yt: "52lc3IjWIAs", aliases: ["michi", "ey das ist kaputt"] },
    { name: "Halt Stop, jetzt rede ich", yt: "39tK5DL1z28", aliases: ["halt stop", "halt stopp", "andreas"] },
    { name: "Was ist denn mit Karsten los", yt: "PeETF41yXbo", aliases: ["karsten"] },
    { name: "Was ist das für 1 Kombi", yt: "q2yHcQuP2q4", aliases: ["kombi"] },
    { name: "Warum liegt hier überhaupt Stroh", yt: "J2ShLsJYWe8", aliases: ["stroh"] },
    { name: "Europa ist ein Land", yt: "ktFTKVf2OKo", aliases: ["unge", "europa"] },
    { name: "Hallo Herr Kaiser", yt: "WKskEcGBTKU", aliases: ["herr kaiser"] },
    { name: "Mega geil", yt: "-IAyb9s6n6k", aliases: ["megageil"] },
    { name: "Migrationshintergrund? Weiße Wand", yt: "l2rMlFXXsvU", aliases: ["migrationshintergrund", "weiße wand"] },
];
const NICHE: Meme[] = [
    { name: "Henri Henrisson", yt: "Yx0Z-mKkIvI", aliases: ["jürgen hurenson", "isländer"] },
    { name: "Dominika – Nicht schnell, langsam", yt: "2uhvWHPmitY", aliases: ["dominika", "nicht schnell", "richard steht hoch"] },
    { name: "Swear to God", yt: "m0gbLf04dOk", aliases: ["trymacs", "swear to god"] },
    { name: "Ich hab Polizei", yt: "PNjG22Gbo6U", aliases: ["polizistensohn", "böhmermann"] },
    { name: "Verpiss dich du Huso", yt: "l9XeZ7_JhR8", aliases: ["montanablack", "monte", "huso"] },
    { name: "Du hast Madeira-Verbot", yt: "d0wnzgaGqNo", aliases: ["madeira", "madeira verbot", "unge"] },
];
const MID_POOL: Meme[] = [...EASY_POOL, ...NICHE];

export const LEVELS: Meme[][] = [
  EASY_POOL,
  MID_POOL,
  MID_POOL,
  [
    { name: "Marcell D'Avis 1&1", yt: "7dOIJbnPoXo", aliases: ["marcel davis", "marcell davis", "1und1"] },
    { name: "Habicht hat zwei H", yt: "2wiFX31VCQs", aliases: ["habicht", "9live"] },
    { name: "Layla", yt: "laru0QoJUmI", aliases: ["dj robin", "schürze"] },
    { name: "Werner – Jaja heißt leck mich", yt: "rt0qE6wAk50", aliases: ["werner", "jaja"] },
    { name: "Ich muss raus", yt: "GIoeXtH4keg", aliases: ["bus kid"] },
    { name: "Sie haben mich ins Gesicht gefilmt", yt: "3O-RygMZ88c", aliases: ["hutbürger", "ins gesicht gefilmt"] },
    { name: "Meddl Loide", yt: "jSAv6EmYIOI", aliases: ["drachenlord", "meddl"] },
  ],
  [
    { name: "Rickroll", yt: "dQw4w9WgXcQ", aliases: ["never gonna give you up"] },
    { name: "Was guckst du?", yt: "uZox54DnTAw", aliases: ["was guckst du", "kaya yanar"] },
    { name: "Flasche leer – Ich habe fertig", yt: "ub1zsUD7UNQ", aliases: ["trapattoni", "flasche leer", "ich habe fertig"] },
    { name: "Das Internet ist für uns alle Neuland", yt: "s_L18bOgnIE", aliases: ["neuland", "merkel"] },
    { name: "Stromberg – Das Leben ist kein Ponyhof", yt: "BMsm8_YOn1o", aliases: ["stromberg", "ponyhof"] },
    { name: "Nein! Doch! Oh!", yt: "w4aLThuU008", aliases: ["nein doch oh", "louis de funes"] },
    { name: "Was machen Sachen", yt: "afhOpXMllH0", aliases: ["tv total"] },
    { name: "Wer ist Shakespeare?", yt: "ByFe08jg8eE", aliases: ["zlatko", "shakespeare", "big brother"] },
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
  const inRun = new Set(run.map((m) => m.yt));
  const bad = new Set(broken);
  const options = pool.filter((m) => !inRun.has(m.yt) && !bad.has(m.yt));
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
    let pool = l.filter((m) => !seen.includes(m.yt) && !chosen.has(m.yt));
    if (!pool.length) {
      seen = seen.filter((id) => !l.some((m) => m.yt === id));
      pool = l.filter((m) => !chosen.has(m.yt));
    }
    if (!pool.length) pool = l;
    const pick = pool[Math.floor(Math.random() * pool.length)]!;
    chosen.add(pick.yt);
    return pick;
  });
  try { localStorage.setItem(key, JSON.stringify([...seen, ...run.map((m) => m.yt)])); } catch {}
  return run;
}

/** Alle Einträge einer Stufenliste ohne Doppelte (für Vorschläge, wenn Stufen sich einen Pool teilen) */
export function uniqueMemes(levels: Meme[][]): Meme[] {
  return [...new Map(levels.flat().map((m) => [m.yt, m])).values()];
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
