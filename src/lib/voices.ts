import type { Meme } from "./memes";

const a = (name: string, yt: string, start: number, aliases: string[] = []): Meme => ({ name, yt, start, aliases });

/**
 * Ein Pool gleich bekannter Schauspieler: überwiegend deutsche, dazu sechs Weltstars, die jeder kennt. Alle Stufen ziehen aus demselben Pool,
 * die Schwierigkeit entsteht allein durch die Länge des Ausschnitts (VOICE_CLIPS).
 * `start` ist die Sekunde, ab der die Person im Video allein und deutlich spricht.
 * Die Quelle darf jedes Video sein (Rede, Interview, Trailer), solange nach
 * `start` mindestens 12 Sekunden Soloton folgen.
 */
export const VOICES: Meme[] = [
    a("Morgan Freeman", "GHQdXGfOdQQ", 95, ["freeman", "morgan"]),
    a("Robert De Niro", "sH5c-WeE07c", 165, ["de niro", "deniro", "robert deniro"]),
    a("Leonardo DiCaprio", "xpyrefzvTpI", 130, ["leo", "dicaprio", "leonardo di caprio"]),
    a("Brad Pitt", "R5Y1mHxfnA8", 135, ["pitt"]),
    a("Will Smith", "7CX7jmZvytA", 320, ["will", "smith"]),
    a("Tom Hanks", "Vd420MYpGek", 100, ["hanks", "forrest gump"]),
    // Deutsche Schauspieler (Video und Startsekunde von Hand geprüft)
    a("Elyas M'Barek", "saqzjNK2Lzc", 32, ["mbarek", "elias mbarek", "elyas mbarek", "elias m'barek", "cem"]),
    a("Matthias Schweighöfer", "I6fDbBLdWnc", 55, ["schweighöfer", "schweighoefer", "matthias schweighofer"]),
    a("Christoph Waltz", "tHx1edLkXwU", 9, ["waltz", "christoph"]),
    a("Moritz Bleibtreu", "LkHOpz6Yo1o", 6, ["bleibtreu", "moritz"]),
    a("Florian David Fitz", "LGLURBZgCaU", 5, ["fitz", "florian fitz"]),
    a("Karoline Herfurth", "iUKJr2dajy0", 91, ["herfurth", "karoline"]),
    a("Jella Haase", "0cXyNFv5sWE", 6, ["haase", "jella", "chantal"]),
    a("Jan Josef Liefers", "zLbpbbVMFVg", 41, ["liefers", "boerne", "börne"]),
    a("Nora Tschirner", "0tfQJuSafaA", 88, ["tschirner", "nora"]),
    a("Alexandra Maria Lara", "wmbXUF5aN40", 16, ["lara", "alexandra lara"]),
    a("Bastian Pastewka", "aPej2lS5yhw", 66, ["pastewka", "bastian"]),
    a("Anke Engelke", "3TVELjt0FRs", 72, ["engelke", "anke"]),
    a("Heike Makatsch", "bduFQBR7UE0", 20, ["makatsch", "heike"]),
    // Weitere deutsche Schauspieler (Video und Startsekunde von Hand geprüft)
    a("Christoph Maria Herbst", "Ef9krqbhGyE", 0, ["herbst", "stromberg", "christoph maria"]),
    a("Michael „Bully“ Herbig", "UY5gCnfHzWo", 27, ["bully herbig", "bully", "herbig", "michael herbig"]),
    a("Jürgen Vogel", "073yH1gBP4A", 0, ["vogel", "juergen vogel"]),
    a("Axel Stein", "KuUbXb_pV_Y", 19, ["stein"]),
    a("Christian Ulmen", "rfCaTR9vjtg", 114, ["ulmen"]),
    a("Otto Waalkes", "EITSYUqpKkU", 21, ["otto", "waalkes"]),
    a("Hape Kerkeling", "9Nk2CdYtk4w", 18, ["hape", "kerkeling"]),
    a("Uwe Ochsenknecht", "G1iCw3bnFwM", 44, ["ochsenknecht", "uwe"]),
    a("Heiner Lauterbach", "AwU2yLLUXEk", 28, ["lauterbach", "heiner"]),
    a("Katja Riemann", "qv3fV2HxAYs", 14, ["riemann", "katja"]),
    a("Veronica Ferres", "0Syl5mua2NY", 9, ["ferres", "veronika ferres", "veronica"]),
    a("Armin Rohde", "KiopCMlv2Bo", 18, ["rohde", "armin"]),
    a("Wotan Wilke Möhring", "IGzoF88o5Zc", 31, ["möhring", "moehring", "wotan", "wotan wilke moehring"]),
    a("Tom Schilling", "3W6rJ_WpR6o", 25, ["schilling"]),
    a("Fahri Yardim", "9BnlqEbkVxc", 61, ["yardim", "fahri", "fahri yardım"]),
    a("Frederick Lau", "AFVrW2JQ7Dg", 21, ["lau", "frederick"]),
    a("Axel Prahl", "25pjCUj5xgU", 0, ["prahl", "thiel"]),
    a("Joachim Król", "BSZIjWfUMqs", 5, ["krol", "król", "joachim krol"]),
    a("Dieter Hallervorden", "ElDJ3MWjBes", 290, ["hallervorden", "didi", "dieter"]),
    a("Sandra Hüller", "ryF_rupOHnQ", 93, ["hüller", "hueller", "sandra hueller", "sandra"]),
];

/** Jede Stufe nutzt denselben Pool. */
export const VOICE_LEVELS: Meme[][] = [VOICES, VOICES, VOICES, VOICES, VOICES];

/**
 * Zeitschritte in Sekunden je Stufe. Stufe 1 beginnt bei 1 s, Stufe 5 bei 0,1 s
 * und wächst dann in kleinen Schritten.
 */
export const VOICE_CLIPS: number[][] = [
  [1, 2, 3.5, 5, 8, 12],
  [0.7, 1.4, 2.4, 3.6, 5.5, 8],
  [0.45, 0.9, 1.6, 2.5, 4, 6],
  [0.25, 0.5, 0.9, 1.5, 2.5, 4],
  [0.1, 0.2, 0.35, 0.6, 1, 2],
];
