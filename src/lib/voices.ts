import type { Meme } from "./memes";

const a = (name: string, yt: string, start: number, aliases: string[] = []): Meme => ({ name, yt, start, aliases });

/**
 * Ein Pool gleich bekannter Schauspieler. Alle Stufen ziehen aus demselben Pool,
 * die Schwierigkeit entsteht allein durch die Länge des Ausschnitts (VOICE_CLIPS).
 * `start` ist die Sekunde, ab der die Person im Video allein und deutlich spricht.
 * Die Quelle darf jedes Video sein (Rede, Interview, Trailer), solange nach
 * `start` mindestens 12 Sekunden Soloton folgen.
 */
export const VOICES: Meme[] = [
    a("Morgan Freeman", "GHQdXGfOdQQ", 95, ["freeman", "morgan"]),
    a("Al Pacino", "p0vE7pR5gg8", 125, ["pacino"]),
    a("Robert De Niro", "sH5c-WeE07c", 165, ["de niro", "deniro", "robert deniro"]),
    a("Jack Nicholson", "H19_nhpvsT0", 185, ["nicholson"]),
    a("Leonardo DiCaprio", "xpyrefzvTpI", 130, ["leo", "dicaprio", "leonardo di caprio"]),
    a("Brad Pitt", "R5Y1mHxfnA8", 135, ["pitt"]),
    a("Will Smith", "7CX7jmZvytA", 320, ["will", "smith"]),
    a("Tom Hanks", "Vd420MYpGek", 100, ["hanks", "forrest gump"]),
    a("Meryl Streep", "rTpaaiPKFw4", 45, ["streep", "meryl"]),
    a("Nicolas Cage", "6jXi-Z3M9Us", 125, ["cage", "nicolas", "nicholas cage"]),
    a("Robert Downey Jr.", "7_vHwsLJY58", 340, ["downey", "rdj", "iron man", "robert downey junior"]),
    a("Christian Bale", "UsEGpXlpcO8", 105, ["bale", "batman"]),
    a("Matthew McConaughey", "wD2cVhC-63I", 80, ["mcconaughey", "matthew"]),
    a("Joaquin Phoenix", "qiiWdTz_MNc", 125, ["phoenix", "joker"]),
    a("Anne Hathaway", "k_b5xav1jls", 135, ["hathaway", "anne"]),
    a("Natalie Portman", "BYvUm1YJBSs", 235, ["portman", "natalie"]),
    a("Nicole Kidman", "D0FWFQpnZ54", 85, ["kidman", "nicole"]),
    a("Emma Stone", "XDYBUnCqsyw", 410, ["stone", "emma"]),
    a("Sandra Bullock", "-hTTwSQPmMo", 555, ["bullock", "sandra"]),
    a("Cate Blanchett", "squYKgRWZN0", 75, ["blanchett", "kate blanchett"]),
    a("Anthony Hopkins", "ftUGtsdSXeU", 120, ["hopkins", "hannibal"]),
    a("Denzel Washington", "wLKDfyFjQtc", 75, ["denzel", "washington"]),
    a("Halle Berry", "llgL7mGYVTI", 150, ["berry", "halle", "haley berry"]),
    a("Charlize Theron", "v70pNFdsBSg", 140, ["theron", "charlize"]),
    a("Viola Davis", "xbo9GVmv87Y", 130, ["davis", "viola"]),
    a("Jamie Foxx", "y2a1nzAciMc", 120, ["foxx", "jamie fox", "django"]),
    a("Christopher Walken", "wh1jTZXhe7k", 75, ["walken", "christopher"]),
    a("Javier Bardem", "PwjeOx5qP1Y", 40, ["bardem", "javier"]),
    a("Russell Crowe", "hwjqlN3jueg", 175, ["crowe", "russell", "gladiator"]),
    a("Jamie Lee Curtis", "dOfMbZLbBDA", 110, ["curtis", "jamie lee"]),
    a("Cillian Murphy", "nUg-dZMrEjA", 300, ["murphy", "cillian", "thomas shelby", "peaky blinders"]),
    a("Brendan Fraser", "PD2w1NNoNE4", 120, ["fraser", "brendan"]),
    a("Eddie Redmayne", "m_ZVJgM-bZI", 100, ["redmayne", "eddie"]),
    a("Gary Oldman", "Nu4lKx-zAvs", 85, ["oldman", "gary"]),
    a("Daniel Day-Lewis", "yKh_XFJ9TWc", 240, ["day lewis", "daniel day lewis", "daniel"]),
    a("Penélope Cruz", "A6QFfJHuFy4", 325, ["cruz", "penelope cruz", "penelope"]),
    a("Reese Witherspoon", "4P0smMYhLsg", 115, ["witherspoon", "reese"]),
    a("Zoe Saldaña", "aeCv6NyMveg", 45, ["saldana", "zoe saldana", "zoe", "gamora"]),
    a("Brie Larson", "b_lq5wORkYA", 120, ["larson", "brie", "captain marvel"]),
    a("Jared Leto", "VCtch3DzLRs", 95, ["leto", "jared"]),
    a("Sean Penn", "9HFRjamyua0", 425, ["penn", "sean"]),
    a("Jeff Bridges", "1AAZCNd3Cj4", 525, ["bridges", "jeff", "the dude"]),
    a("Helen Mirren", "ZunOOuJwY7E", 70, ["mirren", "helen"]),
    a("Julianne Moore", "TzR3CUU51IU", 145, ["moore", "julianne"]),
    a("Michelle Yeoh", "DZldmL7zeSY", 95, ["yeoh", "michelle"]),
    a("Benicio del Toro", "c1SHYDJrIIY", 85, ["del toro", "benicio"]),
    a("Geoffrey Rush", "BLhh7j60CWg", 95, ["rush", "geoffrey", "jeffrey rush"]),
    a("Jeremy Irons", "lsXFl6IKpyI", 70, ["irons", "jeremy"]),
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
