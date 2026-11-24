import { describe, expect, it } from "vitest";
import { cleanRoomCode, createRoomCode, emptyLiveState, liveWinners, parseLiveMsg, reduceLive, runFromIds, standings, type LiveMsg, type LiveState } from "@/lib/live-duel";
import type { Meme } from "@/lib/memes";

const apply = (msgs: LiveMsg[], from: LiveState = emptyLiveState()) => msgs.reduce(reduceLive, from);
const ids = ["a", "b", "c", "d", "e"];
const joined = () => apply([{ type: "join", id: "p1", name: "Anna" }, { type: "join", id: "p2", name: "Ben" }]);
const started = () => apply([{ type: "start", id: "p1", game: "memes", ids }], joined());

describe("Live-Duell: Raum und Start", () => {
  it("sammelt Spieler und ignoriert doppelte Beitritte", () => {
    const s = apply([...[{ type: "join", id: "p1", name: "Anna" }, { type: "join", id: "p1", name: "Anna" }] as LiveMsg[]]);
    expect(Object.keys(s.players)).toEqual(["p1"]);
  });

  it("lässt nach dem Start keine neuen Spieler mehr herein", () => {
    const s = apply([{ type: "join", id: "p3", name: "Cem" }], started());
    expect(s.players["p3"]).toBeUndefined();
  });

  it("begrenzt die Spielerzahl auf acht", () => {
    const msgs: LiveMsg[] = Array.from({ length: 10 }, (_, i) => ({ type: "join", id: `p${i}`, name: `S${i}` }));
    expect(Object.keys(apply(msgs).players)).toHaveLength(8);
  });

  it("startet nur einmal und nur mit fünf Clips", () => {
    expect(apply([{ type: "start", id: "p1", game: "memes", ids: ["a"] }], joined()).started).toBe(false);
    const s = started();
    expect(apply([{ type: "start", id: "p2", game: "stimmen", ids }], s).game).toBe("memes");
  });
});

describe("Live-Duell: Punkte und Rangliste", () => {
  it("zählt Stufen der Reihe nach und deckelt Punkte je Stufe", () => {
    let s = apply([{ type: "score", id: "p1", level: 0, pts: 100 }, { type: "score", id: "p1", level: 0, pts: 100 }, { type: "score", id: "p1", level: 2, pts: 50 }], started());
    expect(s.players["p1"]!.scores).toEqual([100]);
    s = apply([{ type: "score", id: "p1", level: 1, pts: 99999 }], s);
    expect(s.players["p1"]!.scores).toEqual([100, 200]);
  });

  it("ignoriert Punkte vor dem Start und von unbekannten Spielern", () => {
    expect(joined().players["p1"]!.scores).toEqual([]);
    expect(apply([{ type: "score", id: "p1", level: 0, pts: 100 }], joined()).players["p1"]!.scores).toEqual([]);
    expect(apply([{ type: "score", id: "nobody", level: 0, pts: 100 }], started()).players["nobody"]).toBeUndefined();
  });

  it("sortiert nach Punkten und vergibt bei Gleichstand denselben Platz", () => {
    const s = apply([{ type: "score", id: "p1", level: 0, pts: 50 }, { type: "score", id: "p2", level: 0, pts: 100 }], started());
    expect(standings(s).map((r) => [r.name, r.place])).toEqual([["Ben", 1], ["Anna", 2]]);
    const tie = apply([{ type: "score", id: "p1", level: 1, pts: 50 }], s); // Anna 100, Ben 100
    expect(standings(tie).map((r) => r.place)).toEqual([1, 1]);
  });

  it("kürt Sieger erst, wenn alle fertig sind – bei Gleichstand mehrere", () => {
    const play = (id: string, pts: number): LiveMsg[] => [
      ...[0, 1, 2, 3, 4].map((level) => ({ type: "score", id, level, pts: level === 0 ? pts : 0 }) as LiveMsg),
      { type: "finish", id },
    ];
    let s = apply(play("p1", 100), started());
    expect(liveWinners(s)).toBeNull();
    s = apply(play("p2", 40), s);
    expect(liveWinners(s)?.map((w) => w.name)).toEqual(["Anna"]);
    s = apply([], apply(play("p2", 100), apply(play("p1", 100), started())));
    expect(liveWinners(s)?.map((w) => w.name).sort()).toEqual(["Anna", "Ben"]);
  });

  it("lässt „fertig“ erst nach allen fünf Stufen zu", () => {
    expect(apply([{ type: "finish", id: "p1" }], started()).players["p1"]!.finished).toBe(false);
  });
});

describe("Live-Duell: Hilfsfunktionen", () => {
  it("erzeugt vierstellige Raumcodes ohne verwechselbare Zeichen", () => {
    for (let i = 0; i < 50; i++) expect(createRoomCode()).toMatch(/^[A-HJ-NP-Z2-9]{4}$/);
    expect(cleanRoomCode(" k7qm ")).toBe("K7QM");
    expect(cleanRoomCode("K7Q")).toBeNull();
    expect(cleanRoomCode("IO01")).toBeNull();
  });

  it("prüft eingehende Rohnachrichten", () => {
    expect(parseLiveMsg({ type: "join", id: "p1", name: "Anna" })).toEqual({ type: "join", id: "p1", name: "Anna" });
    expect(parseLiveMsg({ type: "score", id: "p1", level: "0", pts: 1 })).toBeNull();
    expect(parseLiveMsg({ type: "bomb", id: "p1" })).toBeNull();
    expect(parseLiveMsg(null)).toBeNull();
    expect(parseLiveMsg({ type: "finish" })).toBeNull();
  });

  it("baut die Runde aus Clip-IDs nach und lehnt unbekannte IDs ab", () => {
    const levels: Meme[][] = [[{ name: "A", yt: "a" }, { name: "B", yt: "b" }], [{ name: "C", yt: "c" }]];
    expect(runFromIds(levels, ["b", "c"])?.map((m) => m.name)).toEqual(["B", "C"]);
    expect(runFromIds(levels, ["c", "c"])).toBeNull();
    expect(runFromIds(levels, ["b"])).toBeNull();
  });
});
