import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { GuessGame } from "@/components/GuessGame";
import { cleanName } from "@/lib/challenge";
import {
  MAX_PLAYERS,
  cleanRoomCode,
  createLocalTransport,
  createRoomCode,
  emptyLiveState,
  liveWinners,
  reduceLive,
  runFromIds,
  standings,
  type LiveGame,
  type LiveMsg,
  type LiveState,
  type LiveTransport,
} from "@/lib/live-duel";
import { LEVELS, memeId, pickRun, type Meme } from "@/lib/memes";
import { VOICE_CLIPS, VOICE_LEVELS } from "@/lib/voices";

const GAMES: Record<LiveGame, { title: [string, string]; label: string; emoji: string; levels: Meme[][]; storageKey: string; placeholder: string; clips?: number[][] }> = {
  memes: { title: ["Meme", "dle"], label: "Memedle", emoji: "😂", levels: LEVELS, storageKey: "memedle-seen", placeholder: "🔍 Welches Meme ist das?" },
  stimmen: { title: ["Stimm", "dle"], label: "Stimmdle", emoji: "🎬", levels: VOICE_LEVELS, storageKey: "stimmdle-seen", placeholder: "🔍 Welcher Schauspieler ist das?", clips: VOICE_CLIPS },
};

const NAME_KEY = "hoerdle-name";

function Standings({ state, me }: { state: LiveState; me: string }) {
  const rows = standings(state);
  const winners = liveWinners(state);
  const winnerIds = new Set(winners?.map((w) => w.id));
  return (
    <section aria-label="Live-Rangliste" className="rounded-2xl border border-border bg-card p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {winners ? "Endstand" : "Live-Rangliste"}
      </p>
      {winners && (
        <p className="mb-2 text-center text-lg font-extrabold text-primary">
          👑 {winners.map((w) => w.name).join(" & ")} {winners.length > 1 ? "gewinnen" : "gewinnt"}!
        </p>
      )}
      <ol className="space-y-1">
        {rows.map((r) => (
          <li key={r.id} className={`flex items-center justify-between rounded-lg px-3 py-1.5 text-sm ${r.id === me ? "bg-primary/10" : ""}`}>
            <span className="truncate">
              <span className="mr-2 inline-block w-5 text-muted-foreground">{r.place}.</span>
              {winnerIds.has(r.id) && "👑 "}
              <span className="font-semibold">{r.name}</span>
              {r.id === me && <span className="text-muted-foreground"> (du)</span>}
            </span>
            <span className="ml-3 shrink-0 text-right">
              <span className="font-extrabold text-primary">{r.total}</span>
              <span className="ml-2 text-xs text-muted-foreground">{r.finished ? "fertig" : `Stufe ${Math.min(r.levelsDone + 1, 5)}/5`}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function LiveDuel() {
  const [state, dispatch] = useReducer(reduceLive, undefined, emptyLiveState);
  const [name, setName] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [game, setGame] = useState<LiveGame>("memes");
  const [code, setCode] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const me = useRef("");
  const transport = useRef<LiveTransport | null>(null);
  const known = useRef(new Set<string>());
  const myName = useRef("");

  useEffect(() => {
    me.current = Math.random().toString(36).slice(2, 10);
    try { setName(localStorage.getItem(NAME_KEY) ?? ""); } catch { /* egal */ }
    const fromLink = cleanRoomCode(new URLSearchParams(window.location.search).get("raum"));
    if (fromLink) setCodeInput(fromLink);
    return () => transport.current?.close();
  }, []);

  const send = useCallback((msg: LiveMsg) => transport.current?.send(msg), []);

  const enter = (roomCode: string, host: boolean) => {
    const playerName = cleanName(name) ?? "Spieler";
    myName.current = playerName;
    try { localStorage.setItem(NAME_KEY, playerName); } catch { /* egal */ }
    transport.current?.close();
    const t = createLocalTransport(roomCode);
    transport.current = t;
    known.current = new Set();
    t.subscribe((msg) => {
      dispatch(msg);
      // Neue Spieler kennen uns noch nicht: einmal antworten, damit alle dieselbe Spielerliste sehen.
      if (msg.type === "join" && msg.id !== me.current && !known.current.has(msg.id)) {
        known.current.add(msg.id);
        t.send({ type: "join", id: me.current, name: myName.current });
      }
    });
    setCode(roomCode);
    setIsHost(host);
    setError(null);
    t.send({ type: "join", id: me.current, name: playerName });
  };

  const create = () => enter(createRoomCode(), true);
  const join = () => {
    const c = cleanRoomCode(codeInput);
    if (!c) return setError("Der Raumcode besteht aus 4 Zeichen, z. B. K7QM.");
    enter(c, false);
  };

  const run = useMemo(() => (state.started && state.game && state.ids ? runFromIds(GAMES[state.game].levels, state.ids) : null), [state.started, state.game, state.ids]);
  const playerCount = Object.keys(state.players).length;

  const start = () => {
    if (playerCount < 2) return setError("Wartet auf mindestens eine weitere Person.");
    const g = GAMES[game];
    send({ type: "start", id: me.current, game, ids: pickRun(g.levels, g.storageKey).map(memeId) });
  };

  const back = (
    <Link to="/" className="mb-4 inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold transition hover:border-primary">
      <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Zurück zum Menü
    </Link>
  );

  // Läuft: dieselbe Spieloberfläche, nur mit fester Runde und Live-Rangliste.
  if (state.started && state.game && run) {
    const g = GAMES[state.game];
    return (
      <GuessGame
        levels={g.levels}
        storageKey={g.storageKey}
        title={g.title}
        placeholder={g.placeholder}
        clips={g.clips}
        live={{
          run,
          onLevelDone: (level, pts) => send({ type: "score", id: me.current, level, pts }),
          onFinish: () => send({ type: "finish", id: me.current }),
          panel: <Standings state={state} me={me.current} />,
        }}
      />
    );
  }

  const shareUrl = code && typeof window !== "undefined" ? `${window.location.origin}/live?raum=${code}` : "";
  const copy = async () => {
    try { await navigator.clipboard.writeText(shareUrl); setCopied(true); } catch { /* egal */ }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-4 pb-10 pt-6">
      {back}
      <h1 className="text-3xl font-extrabold tracking-tight">Live-<span className="text-primary">Duell</span></h1>
      <p className="mt-1 text-sm text-muted-foreground">Gleichzeitig dieselben fünf Sounds – mit Live-Punkten und Siegerkrone.</p>

      {!code ? (
        <div className="mt-6 space-y-4">
          <label className="block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Dein Name
            <input value={name} maxLength={20} onChange={(e) => setName(e.target.value)} placeholder="z. B. Henri"
              className="mt-1 w-full rounded-xl border border-input bg-card px-4 py-3 text-base font-normal normal-case tracking-normal text-foreground outline-none focus:border-ring" />
          </label>
          <button onClick={create} className="w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground">Raum erstellen</button>
          <div className="flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border" />oder<span className="h-px flex-1 bg-border" /></div>
          <div className="flex gap-2">
            <input value={codeInput} maxLength={4} onChange={(e) => setCodeInput(e.target.value.toUpperCase())} placeholder="Raumcode" aria-label="Raumcode"
              className="w-full rounded-xl border border-input bg-card px-4 py-3 text-center text-base font-bold uppercase tracking-[0.3em] outline-none focus:border-ring" />
            <button onClick={join} className="shrink-0 rounded-xl bg-secondary px-5 py-3 font-bold text-secondary-foreground">Beitreten</button>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border-2 border-primary/40 bg-card p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Raumcode</p>
            <p className="text-5xl font-extrabold tracking-[0.25em] text-primary">{code}</p>
            <button onClick={copy} className="mt-2 text-xs font-semibold underline underline-offset-4 hover:text-primary">{copied ? "Link kopiert!" : "Einladungslink kopieren"}</button>
          </div>
          <section aria-label="Spieler" className="rounded-2xl border border-border bg-card p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Spieler ({playerCount}/{MAX_PLAYERS})</p>
            <ul className="space-y-1 text-sm">
              {Object.values(state.players).map((p) => (
                <li key={p.id} className="rounded-lg px-3 py-1.5 font-semibold">{p.name}{p.id === me.current && <span className="font-normal text-muted-foreground"> (du)</span>}</li>
              ))}
            </ul>
          </section>
          {isHost ? (
            <>
              <div role="radiogroup" aria-label="Spiel wählen" className="grid grid-cols-2 gap-2">
                {(Object.keys(GAMES) as LiveGame[]).map((k) => (
                  <button key={k} role="radio" aria-checked={game === k} onClick={() => setGame(k)}
                    className={`rounded-xl border-2 p-3 text-sm font-bold transition ${game === k ? "border-primary bg-primary/10" : "border-border bg-card"}`}>
                    {GAMES[k].emoji} {GAMES[k].label}
                  </button>
                ))}
              </div>
              <button onClick={start} disabled={playerCount < 2} className="w-full rounded-xl bg-accent py-3 font-bold text-accent-foreground disabled:opacity-40">
                {playerCount < 2 ? "Wartet auf Mitspieler …" : "Runde starten"}
              </button>
            </>
          ) : (
            <p className="rounded-xl border border-dashed border-border p-3 text-center text-sm text-muted-foreground">Warte, bis der Host die Runde startet …</p>
          )}
        </div>
      )}
      {error && <p role="alert" className="mt-3 text-center text-sm text-destructive">{error}</p>}
      {state.started && !run && <p role="alert" className="mt-3 text-center text-sm text-destructive">Die Runde konnte nicht geladen werden. Bitte neuen Raum erstellen.</p>}
      <p className="mt-6 text-center text-xs text-muted-foreground">Hinweis: Diese Version verbindet Fenster im selben Browser. Für Spieler auf verschiedenen Geräten fehlt noch der Server-Anschluss.</p>
    </main>
  );
}
