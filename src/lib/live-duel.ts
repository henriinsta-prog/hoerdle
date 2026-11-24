import { cleanName } from "./challenge";
import type { Meme } from "./memes";

/**
 * Live-Duelle: mehrere Spieler spielen gleichzeitig dieselben fünf Clips,
 * jeder sieht die Rangliste der anderen live.
 *
 * Alles hier ist reine Logik ohne Netzwerk. Wie Nachrichten zwischen den Spielern
 * reisen, regelt ein `LiveTransport`. Mitgeliefert ist `createLocalTransport`
 * (mehrere Tabs im selben Browser). Für Spieler auf verschiedenen Geräten
 * braucht es einen Server-Transport (z. B. Realtime-Kanal), der dasselbe
 * Interface erfüllt, ohne dass sich Spiel oder Oberfläche ändern.
 */

export type LiveGame = "memes" | "stimmen";

export type LiveMsg =
  | { type: "join"; id: string; name: string }
  | { type: "start"; id: string; game: LiveGame; ids: string[] }
  | { type: "score"; id: string; level: number; pts: number }
  | { type: "finish"; id: string };

export type LivePlayer = { id: string; name: string; scores: number[]; finished: boolean };

export type LiveState = {
  players: Record<string, LivePlayer>;
  /** Wer den Raum erstellt hat (Spieler, der zuerst „start“ sendet, ist Host-Rolle nur in der Oberfläche). */
  started: boolean;
  game: LiveGame | null;
  ids: string[] | null;
};

export const MAX_PLAYERS = 8;
export const LEVEL_COUNT = 5;

export const emptyLiveState = (): LiveState => ({ players: {}, started: false, game: null, ids: null });

/** Wendet eine Nachricht an. Doppelte oder ungültige Nachrichten ändern nichts. */
export function reduceLive(state: LiveState, msg: LiveMsg): LiveState {
  switch (msg.type) {
    case "join": {
      if (state.started && !state.players[msg.id]) return state;
      const known = state.players[msg.id];
      if (!known && Object.keys(state.players).length >= MAX_PLAYERS) return state;
      const name = cleanName(msg.name) ?? "Spieler";
      return {
        ...state,
        players: { ...state.players, [msg.id]: { id: msg.id, name, scores: known?.scores ?? [], finished: known?.finished ?? false } },
      };
    }
    case "start": {
      if (state.started || msg.ids.length !== LEVEL_COUNT) return state;
      return { ...state, started: true, game: msg.game, ids: msg.ids };
    }
    case "score": {
      const p = state.players[msg.id];
      if (!state.started || !p || p.finished) return state;
      if (!Number.isInteger(msg.level) || msg.level < 0 || msg.level >= LEVEL_COUNT) return state;
      if (msg.level !== p.scores.length) return state; // nur der nächste Level zählt, kein Doppelzählen
      const pts = Math.max(0, Math.min((msg.level + 1) * 100, Math.round(msg.pts)));
      return { ...state, players: { ...state.players, [p.id]: { ...p, scores: [...p.scores, pts] } } };
    }
    case "finish": {
      const p = state.players[msg.id];
      if (!state.started || !p || p.scores.length < LEVEL_COUNT) return state;
      return { ...state, players: { ...state.players, [p.id]: { ...p, finished: true } } };
    }
  }
}

export type Standing = { id: string; name: string; total: number; levelsDone: number; finished: boolean; place: number };

/** Rangliste nach Punkten; bei Gleichstand teilen sich Spieler denselben Platz. */
export function standings(state: LiveState): Standing[] {
  const rows = Object.values(state.players).map((p) => ({
    id: p.id,
    name: p.name,
    total: p.scores.reduce((a, b) => a + b, 0),
    levelsDone: p.scores.length,
    finished: p.finished,
  }));
  rows.sort((a, b) => b.total - a.total || b.levelsDone - a.levelsDone || a.name.localeCompare(b.name, "de"));
  let place = 0;
  return rows.map((r, i) => {
    if (i === 0 || r.total !== rows[i - 1]!.total) place = i + 1;
    return { ...r, place };
  });
}

/** Alle Spieler fertig? Dann stehen die Sieger (Platz 1, ggf. mehrere) fest. */
export function liveWinners(state: LiveState): Standing[] | null {
  const rows = standings(state);
  if (!state.started || rows.length === 0 || !rows.every((r) => r.finished)) return null;
  return rows.filter((r) => r.place === 1);
}

const ROOM_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // ohne verwechselbare Zeichen (I, O, 0, 1)

export function createRoomCode(random: () => number = Math.random): string {
  let code = "";
  for (let i = 0; i < 4; i++) code += ROOM_ALPHABET[Math.floor(random() * ROOM_ALPHABET.length)];
  return code;
}

export function cleanRoomCode(raw: string | null | undefined): string | null {
  const code = (raw ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  return code.length === 4 && [...code].every((c) => ROOM_ALPHABET.includes(c)) ? code : null;
}

export interface LiveTransport {
  send(msg: LiveMsg): void;
  subscribe(listener: (msg: LiveMsg) => void): () => void;
  close(): void;
}

/** Prüft eingehende Rohdaten, bevor sie die Logik erreichen. */
export function parseLiveMsg(data: unknown): LiveMsg | null {
  if (!data || typeof data !== "object") return null;
  const m = data as Record<string, unknown>;
  if (typeof m.id !== "string" || m.id.length === 0 || m.id.length > 40) return null;
  switch (m.type) {
    case "join":
      return typeof m.name === "string" ? { type: "join", id: m.id, name: m.name } : null;
    case "start":
      return (m.game === "memes" || m.game === "stimmen") && Array.isArray(m.ids) && m.ids.every((x) => typeof x === "string")
        ? { type: "start", id: m.id, game: m.game, ids: m.ids as string[] }
        : null;
    case "score":
      return typeof m.level === "number" && typeof m.pts === "number" ? { type: "score", id: m.id, level: m.level, pts: m.pts } : null;
    case "finish":
      return { type: "finish", id: m.id };
    default:
      return null;
  }
}

/** Transport für Tabs im selben Browser (BroadcastChannel). Zum Testen und als Vorlage. */
export function createLocalTransport(code: string): LiveTransport {
  const channel = new BroadcastChannel(`hoerdle-live-${code}`);
  const listeners = new Set<(msg: LiveMsg) => void>();
  channel.onmessage = (event) => {
    const msg = parseLiveMsg(event.data);
    if (msg) listeners.forEach((l) => l(msg));
  };
  return {
    send: (msg) => {
      channel.postMessage(msg);
      listeners.forEach((l) => l(msg)); // eigene Nachrichten kommen nicht per Channel zurück
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    close: () => {
      listeners.clear();
      channel.close();
    },
  };
}

/** Wandelt die Clip-IDs einer Start-Nachricht zurück in die Runde; null bei ungültigen IDs. */
export function runFromIds(levels: Meme[][], ids: string[]): Meme[] | null {
  if (ids.length !== levels.length) return null;
  const run = ids.map((id, i) => levels[i]?.find((m) => m.yt === id));
  return run.every((m): m is Meme => Boolean(m)) ? run : null;
}
