import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { LEVEL_CLIPS, LEVEL_NAMES, isCorrect, pickRun, points, rank, suggest, uniqueMemes, markBroken, readBroken, replacementFor, type Meme } from "@/lib/memes";
import { resultGrid } from "@/lib/result-share";
import { feedback } from "@/lib/fx";
import { StatsCard } from "@/components/StatsCard";
import { addRound, isNewRecord, loadRounds, saveRounds, statsKey, type RoundRecord } from "@/lib/stats";
import { challengeFromSearch, challengerFromSearch, cleanName, createChallengeUrl, duelOutcome, type ChallengerInfo } from "@/lib/challenge";

declare global { interface Window { YT?: any; onYouTubeIframeAPIReady?: () => void } }

type Attempt = { text: string; kind: "wrong" | "skip" | "right" };

/** Anbindung für Live-Duelle: feste Runde, Meldung jeder Stufe, Rangliste als Zusatzfeld. */
export type LiveHooks = {
  run: Meme[];
  onLevelDone: (level: number, pts: number) => void;
  onFinish: () => void;
  /** Wird unter der Kopfzeile (im Spiel) und auf der Auswertung gezeigt. */
  panel: ReactNode;
};

const NAME_KEY = "hoerdle-name";

export function GuessGame({ levels, storageKey, title, placeholder, live, clips }: { levels: Meme[][]; storageKey: string; title: [string, string]; placeholder: string; live?: LiveHooks; clips?: number[][] }) {
  const MEMES = useMemo(() => uniqueMemes(levels), [levels]);
  const [run, setRun] = useState<Meme[]>([]);
  const [level, setLevel] = useState(0);
  const [results, setResults] = useState<{ meme: Meme; attempts: number; won: boolean; pts: number; kinds: Attempt["kind"][] }[]>([]);
  const [finished, setFinished] = useState(false);
  const idx = level;
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isDuel, setIsDuel] = useState(false);
  const [challenger, setChallenger] = useState<ChallengerInfo | null>(null);
  const [myName, setMyName] = useState("");

  useEffect(() => {
    try { setMyName(localStorage.getItem(NAME_KEY) ?? ""); } catch { /* ohne Speicher geht es auch */ }
    if (live) { setRun(live.run); return; }
    const duel = challengeFromSearch(levels, window.location.search);
    setRun(duel ?? pickRun(levels, storageKey));
    setIsDuel(Boolean(duel));
    setChallenger(duel ? challengerFromSearch(window.location.search) : null);
  }, []);
  const [dur, setDur] = useState(0);
  const CLIPS = useMemo(() => {
    const base = (clips ?? LEVEL_CLIPS)[level]!;
    const last = base[base.length - 1]!;
    if (!dur || dur >= last) return base;
    const k = dur / last;
    return base.map((c) => Math.round(c * k * 100) / 100);
  }, [level, dur, clips]);
  const meme = run[level] ?? MEMES[0]!;
  const won = attempts.some((a) => a.kind === "right");
  const done = won || attempts.length >= CLIPS.length;
  const clip = CLIPS[Math.min(attempts.length, CLIPS.length - 1)]!;
  const maxLen = done ? CLIPS[CLIPS.length - 1]! : clip;
  const player = useRef<any>(null);
  const timer = useRef<number | undefined>(undefined);
  const raf = useRef<number | undefined>(undefined);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [statsRounds, setStatsRounds] = useState<RoundRecord[]>([]);
  const [newRecord, setNewRecord] = useState(false);
  const [shake, setShake] = useState(false);
  const onClipError = useRef<(code: number) => void>(() => {});
  const onState = useRef<(state: number) => void>(() => {});
  /** Zeitleiste und Stopp laufen erst, wenn der Ton wirklich läuft (YouTube braucht nach Play einen Moment) */
  const run_ = useRef({ want: false, counting: false, since: 0, before: 0, len: 0, guard: undefined as number | undefined });

  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let p: any; let dead = false;
    const create = () => {
      if (dead || !box.current) return;
      const el = document.createElement("div");
      box.current.appendChild(el);
      p = new window.YT.Player(el, {
        height: "1", width: "1",
        playerVars: { controls: 0, disablekb: 1, playsinline: 1 },
        events: {
          onReady: () => { if (!dead) { player.current = p; setReady(true); } },
          onError: (e: { data: number }) => { if (!dead) onClipError.current(e.data); },
          onStateChange: (e: { data: number }) => { if (!dead) onState.current(e.data); },
        },
      });
    };
    if (window.YT?.Player) create();
    else {
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { prev?.(); create(); };
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const sc = document.createElement("script");
        sc.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(sc);
      }
    }
    return () => { dead = true; setReady(false); try { p?.destroy?.(); } catch {} if (box.current) box.current.innerHTML = ""; player.current = null; };
  }, []);

  const stop = () => {
    const r = run_.current;
    window.clearTimeout(timer.current); window.clearTimeout(r.guard); cancelAnimationFrame(raf.current!);
    r.want = false; r.counting = false; r.before = 0;
    player.current?.pauseVideo?.(); setPlaying(false);
  };
  useEffect(() => {
    stop(); setPos(0);
    setDur(0);
    if (!ready || !player.current) return;
    const p = player.current;
    p.cueVideoById({ videoId: meme.yt, startSeconds: meme.start ?? 0 });
    let n = 0; let probing = false;
    const iv = window.setInterval(() => {
      const d = p.getDuration?.() ?? 0;
      if (d > 0) {
        setDur(Math.max(0.5, d - (meme.start ?? 0))); window.clearInterval(iv);
        if (probing) { p.pauseVideo(); p.seekTo(meme.start ?? 0, true); p.unMute(); }
      } else if (n === 5 && !probing) { probing = true; p.mute(); p.playVideo(); }
      else if (++n > 50) window.clearInterval(iv);
    }, 100);
    return () => window.clearInterval(iv);
  }, [ready, idx, run]);

  /** Clip gelöscht oder gesperrt: in normalen Runden ein neuer Clip, bei Duellen (gleiche Clips für alle) zählt die Stufe als übersprungen. */
  onClipError.current = (code) => {
    if (![2, 100, 101, 150].includes(code)) return; // 5 u. a. sind kurze Aussetzer, kein dauerhafter Fehler
    const loaded = player.current?.getVideoData?.()?.video_id;
    if (loaded && loaded !== meme.yt) return; // Fehler eines schon abgelösten Clips
    console.warn(`[Hördle] Clip nicht abspielbar: "${meme.name}" (${meme.yt}), Fehlercode ${code}`);
    markBroken(meme.yt);
    stop();
    const fixed = !isDuel && !live ? replacementFor(levels[level] ?? [], run, readBroken()) : null;
    if (fixed) {
      setRun((r) => r.map((m, i) => (i === level ? fixed : m)));
      setAttempts([]);
      setNotice("Dieser Clip ließ sich nicht abspielen – wir haben einen neuen geladen.");
    } else {
      setAttempts(Array.from({ length: CLIPS.length }, () => ({ text: "", kind: "skip" as const })));
      setNotice("Dieser Clip ließ sich nicht abspielen und zählt als übersprungen (0 Punkte).");
    }
  };

  const play = () => {
    if (!ready) return;
    if (playing) return stop();
    const p = player.current; const r = run_.current;
    const start = meme.start ?? 0;
    r.want = true; r.counting = false; r.before = 0; r.len = maxLen * 1000;
    setPos(0); setPlaying(true);
    // Vorspulen nur, wenn nötig: ein unnötiger Sprung zwingt YouTube zum erneuten Puffern
    let cur = start; try { cur = p.getCurrentTime?.() ?? start; } catch {}
    if (Math.abs(cur - start) > 0.3) p.seekTo(start, true);
    p.unMute(); p.setVolume(100); p.playVideo();
    // Kommt nach 5 s kein Ton, aufgeben statt ewig zu warten
    r.guard = window.setTimeout(() => { if (!run_.current.counting) stop(); }, 5000);
  };
  const tick = () => {
    const r = run_.current;
    if (!r.counting) return;
    setPos(Math.min((r.before + performance.now() - r.since) / 1000, r.len / 1000));
    raf.current = requestAnimationFrame(tick);
  };
  onState.current = (state) => {
    const r = run_.current;
    if (!r.want) return; // Zustände ohne unseren Start (Vorladen, Vorspulen) ignorieren
    if (state === 1) { // Ton läuft: ab jetzt zählt die Zeit
      window.clearTimeout(r.guard); window.clearTimeout(timer.current);
      r.counting = true; r.since = performance.now();
      timer.current = window.setTimeout(stop, Math.max(0, r.len - r.before));
      cancelAnimationFrame(raf.current!); tick();
    } else if (state === 3 && r.counting) { // Puffern mitten im Clip: Zeit anhalten
      r.before += performance.now() - r.since; r.counting = false;
      window.clearTimeout(timer.current); cancelAnimationFrame(raf.current!);
      window.clearTimeout(r.guard); r.guard = window.setTimeout(() => { if (!run_.current.counting) stop(); }, 5000);
    } else if (state === 0) stop();
  };
  const suggestions = useMemo(() => suggest(input, MEMES), [input, MEMES]);
  /** Genau passende Eingabe (auch Alias) zählt; sonst der oberste Vorschlag */
  const pick = () => (isCorrect(input, meme) ? input : suggestions[0]?.name ?? input);

  const add = (a: Attempt) => {
    setAttempts((p) => [...p, a]); setInput(""); setOpen(false);
    feedback(a.kind === "right" ? "right" : a.kind === "wrong" ? "wrong" : "skip");
    if (a.kind === "wrong") { setShake(true); window.setTimeout(() => setShake(false), 450); }
  };
  const submit = (g: string) => {
    if (!g.trim() || done) return;
    add({ text: g, kind: isCorrect(g, meme) ? "right" : "wrong" });
  };
  useEffect(() => { if (done) stop(); }, [done]);
  const next = () => {
    const r = { meme, attempts: attempts.length, won, pts: points(level, attempts.length, won), kinds: attempts.map((a) => a.kind) };
    const all = [...results, r];
    setResults(all); setAttempts([]); setNotice(null);
    live?.onLevelDone(level, r.pts);
    if (level >= 4) {
      const total = all.reduce((sum, x) => sum + x.pts, 0);
      const key = statsKey(storageKey);
      const previous = loadRounds(key);
      const updated = addRound(previous, { t: Date.now(), score: total, attempts: all.map((x) => (x.won ? x.attempts : null)) });
      saveRounds(key, updated);
      setStatsRounds(updated);
      const record = isNewRecord(previous, total);
      setNewRecord(record);
      if (record || (challenger && duelOutcome(total, challenger.score) === "win")) feedback("win");
      setFinished(true); live?.onFinish();
    } else setLevel(level + 1);
  };
  const restart = () => {
    window.history.replaceState(null, "", window.location.pathname);
    setRun(pickRun(levels, storageKey)); setLevel(0); setResults([]); setFinished(false); setAttempts([]); setCopied(false); setIsDuel(false); setChallenger(null); setNotice(null); setNewRecord(false);
  };
  const backButton = (
    <Link to="/" className="mb-4 inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold transition hover:border-primary">
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Zurück zum Menü
    </Link>
  );

  if (finished) {
    const total = results.reduce((a, r) => a + r.pts, 0);
    const grid = resultGrid(results);
    const share = async () => {
      const me = cleanName(myName);
      const url = createChallengeUrl(window.location.origin, window.location.pathname, results.map((r) => r.meme), { score: total, name: me });
      const intro = challenger ? `${title.join("")}-Rückduell ⚔️` : `${title.join("")}-Duell ⚔️`;
      const text = `${intro}\n${me ? `${me} hat` : "Ich habe"} ${total} Punkte – schaffst du mehr?\n${rank(total)}\n\n${grid.join("\n")}\n\nSpiel exakt dieselben fünf Sounds:\n${url}`;
      try {
        if (navigator.share) await navigator.share({ title: `${title.join("")}-Duell`, text });
        else {
          await navigator.clipboard.writeText(text);
          setCopied(true);
        }
      } catch { /* Ein abgebrochener Teilen-Dialog verändert das Ergebnis nicht. */ }
    };
    return (
      <>{<div ref={box} className="pointer-events-none fixed -left-10 top-0 h-px w-px opacity-0" />}
      <main className="mx-auto flex min-h-screen max-w-md flex-col px-4 pb-10 pt-6">
        {backButton}
        <h1 className="text-3xl font-extrabold tracking-tight"><Link to="/">{title[0]}<span className="text-primary">{title[1]}</span></Link></h1>
        <div className="mt-6 rounded-2xl bg-card p-5 text-center">
          <p className="text-sm text-muted-foreground">Gesamtpunkte</p>
          <p className="text-5xl font-extrabold text-primary">{total}</p>
          <p className="mt-2 text-lg font-bold">{rank(total)}</p>
        </div>
        {challenger && (() => {
          const outcome = duelOutcome(total, challenger.score);
          const who = challenger.name ?? "Dein Freund";
          const tone = outcome === "win" ? "border-primary bg-primary/10" : outcome === "lose" ? "border-destructive/60 bg-destructive/10" : "border-border bg-card";
          return (
            <div className={`mt-4 rounded-2xl border-2 p-4 text-center ${tone}`} data-testid="duel-result">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">⚔️ Duell</p>
              <p className="mt-1 text-2xl font-extrabold">
                {outcome === "win" ? `Du gewinnst gegen ${who}! 👑` : outcome === "lose" ? `${who} gewinnt diesmal 😬` : "Unentschieden 🤝"}
              </p>
              <p className="mt-2 text-sm">
                <span className="font-bold">Du {total}</span> <span className="text-muted-foreground">:</span> <span className="font-bold">{challenger.score} {who}</span>
              </p>
              {outcome !== "draw" && <p className="mt-1 text-xs text-muted-foreground">{Math.abs(total - challenger.score)} Punkte Unterschied</p>}
            </div>
          );
        })()}
        {live && <div className="mt-4">{live.panel}</div>}
        <StatsCard rounds={statsRounds} newRecord={newRecord} />
        <ul className="mt-4 space-y-2">
          {results.map((r, i) => (
            <li key={i} className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Stufe {i + 1} · {LEVEL_NAMES[i]}</p>
                <p className="font-semibold">{r.won ? "✓" : "✕"} {r.meme.name}</p>
                <p className="text-xs text-muted-foreground">{r.won ? `${r.attempts} ${r.attempts === 1 ? "Versuch" : "Versuche"}` : "nicht erkannt"}</p>
              </div>
              <span className="text-xl font-extrabold text-primary">{r.pts}</span>
            </li>
          ))}
        </ul>
        {!live && (
        <label className="mt-4 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Dein Name für den Duell-Link (optional)
          <input value={myName} maxLength={20} placeholder="z. B. Henri"
            onChange={(e) => { setMyName(e.target.value); try { localStorage.setItem(NAME_KEY, e.target.value); } catch { /* egal */ } setCopied(false); }}
            className="mt-1 w-full rounded-xl border border-input bg-card px-4 py-2.5 text-sm font-normal normal-case tracking-normal text-foreground outline-none focus:border-ring" />
        </label>
        )}
        <div className="mt-4 rounded-2xl border border-border bg-card p-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Dein Emoji-Ergebnis</p>
          <pre aria-label="Ergebnis als Emoji-Muster" className="mt-2 font-sans text-xl leading-8 tracking-wider">{grid.join("\n")}</pre>
          {!live && <p className="mt-2 text-xs text-muted-foreground">Deine Freunde spielen exakt dieselben fünf Sounds.</p>}
        </div>
        {!live && (
          <>
            <button onClick={share} className="mt-3 w-full rounded-xl bg-secondary py-3 font-bold text-secondary-foreground">
              {copied ? "Duell-Link kopiert!" : challenger ? "⚔️ Rückduell senden" : "⚔️ Freunde herausfordern"}
            </button>
            <button onClick={restart} className="mt-3 w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground">Neue Runde</button>
          </>
        )}
      </main>
      </>
    );
  }

  return (
    <>{<div ref={box} className="pointer-events-none fixed -left-10 top-0 h-px w-px opacity-0" />}
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-4 pb-10 pt-6">
      {backButton}
      <header className="mb-5 flex items-center justify-between border-b border-border pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight"><Link to="/">{title[0]}<span className="text-primary">{title[1]}</span></Link></h1>
        <div className="text-right text-sm">
          {isDuel && <p className="text-xs font-bold text-primary">⚔️ Duell{challenger ? ` gegen ${challenger.name ?? "Freund"} (${challenger.score})` : " aktiv"}</p>}
          {live && <p className="text-xs font-bold text-primary">🔴 Live-Duell</p>}
          <p className="font-bold">Stufe {level + 1}/5</p>
          <p className="text-xs text-muted-foreground">{LEVEL_NAMES[level]}</p>
        </div>
      </header>
      {live && <div className="mb-4">{live.panel}</div>}
      {notice && <p role="status" className="mb-4 rounded-xl border border-border bg-card px-4 py-3 text-sm">{notice}</p>}

      <div className={`mb-4 space-y-1.5 ${shake ? "fx-shake" : ""}`}>
        {CLIPS.map((_, i) => {
          const a = attempts[i];
          const cls = !a ? (i === attempts.length && !done ? "border-primary/60" : "border-border")
            : a.kind === "right" ? "border-primary bg-primary/15 text-primary"
            : a.kind === "skip" ? "border-border text-muted-foreground" : "border-destructive/60 text-destructive";
          return (
            <div key={i} className={`flex h-9 items-center gap-2 rounded-md border px-3 text-sm ${cls}`}>
              {a && <span>{a.kind === "right" ? "✓" : a.kind === "skip" ? "⏭" : "✕"}</span>}
              <span className="truncate">{a ? (a.kind === "skip" ? "Übersprungen" : a.text) : ""}</span>
            </div>
          );
        })}
      </div>

      <div className="relative h-3 overflow-hidden rounded-full bg-muted">
        <div className="absolute inset-y-0 left-0 bg-accent/40" style={{ width: `${(maxLen / CLIPS[CLIPS.length - 1]!) * 100}%` }} />
        <div className="absolute inset-y-0 left-0 bg-primary" style={{ width: `${(pos / CLIPS[CLIPS.length - 1]!) * 100}%` }} />
        {CLIPS.map((c, i) => (
          <div key={i} className="absolute inset-y-0 w-px bg-background" style={{ left: `${(c / CLIPS[CLIPS.length - 1]!) * 100}%` }} />
        ))}
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>{pos.toFixed(1)}s</span><span>{done ? "aufgelöst" : `${clip}s freigeschaltet`}</span>
      </div>
      <button onClick={play} disabled={!ready} aria-label={playing ? "Stopp" : "Abspielen"}
        className="mx-auto mt-5 flex h-24 w-24 items-center justify-center rounded-full bg-primary text-4xl text-primary-foreground shadow-glow transition active:scale-95 disabled:opacity-40">
        {!ready ? "…" : playing ? "■" : "▶"}
      </button>

      {done ? (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
        <div className={`w-full max-w-md rounded-2xl border-2 bg-card p-5 text-center shadow-glow animate-in zoom-in-95 fade-in ${won ? "border-primary" : "border-destructive"}`}>
          <p className={`text-3xl font-extrabold ${won ? "text-primary" : "text-destructive"}`}>{won ? "Erraten! 🎉" : "Nicht erraten 😬"}</p>
          <p className="mt-1 text-sm text-muted-foreground">{won ? `Geschafft in ${attempts.length} ${attempts.length === 1 ? "Versuch" : "Versuchen"}` : "Das war:"}</p>
          <p className="mt-1 text-2xl font-extrabold text-primary">{meme.name}</p>
          <p className="text-sm text-muted-foreground">+{points(level, attempts.length, won)} Punkte</p>
          <div className="mt-4 aspect-video w-full overflow-hidden rounded-xl bg-muted">
            <iframe key={meme.yt} className="h-full w-full" allow="autoplay; encrypted-media" allowFullScreen title={meme.name}
              src={`https://www.youtube.com/embed/${meme.yt}?autoplay=1&start=${meme.start ?? 0}`} />
          </div>
          <button onClick={next}
            className="mt-4 w-full rounded-xl bg-accent py-3 font-bold text-accent-foreground">{level >= 4 ? "Zur Auswertung" : `Weiter zu Stufe ${level + 2}`}</button>
        </div>
        </div>
      ) : (
        <div className="relative mt-6">
          {open && suggestions.length > 0 && (
            <ul className="absolute bottom-full mb-2 w-full overflow-hidden rounded-xl border border-border bg-popover">
              {suggestions.map((m) => (
                <li key={m.name}>
                  <button className="w-full px-4 py-2.5 text-left text-sm hover:bg-secondary" onClick={() => submit(m.name)}>{m.name}</button>
                </li>
              ))}
            </ul>
          )}
          <input value={input} onChange={(e) => { setInput(e.target.value); setOpen(true); }}
            onKeyDown={(e) => e.key === "Enter" && submit(pick())}
            placeholder={placeholder}
            className="w-full rounded-xl border border-input bg-card px-4 py-3 outline-none focus:border-ring" />
          <div className="mt-3 flex gap-2">
            <button onClick={() => { stop(); add({ text: "", kind: "skip" }); }}
              className="flex-1 rounded-xl bg-secondary py-3 font-semibold text-secondary-foreground">
              Überspringen{attempts.length < CLIPS.length - 1 ? ` (+${+(CLIPS[attempts.length + 1]! - clip).toFixed(2)}s)` : ""}
            </button>
            <button onClick={() => submit(pick())}
              className="flex-1 rounded-xl bg-primary py-3 font-bold text-primary-foreground">Raten</button>
          </div>
        </div>
      )}
    </main>
    </>
  );
}
