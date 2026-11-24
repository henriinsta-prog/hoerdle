import { ArrowLeft } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BLITZ_CLIPS, BLITZ_SECONDS, blitzRank, blitzShareText, clipSeconds, drawNext, isNewBlitzRecord, loadBlitz, pointsFor, saveBlitz,
  blitzBest, type BlitzGameKey, type BlitzRecord,
} from "@/lib/blitz";
import { feedback } from "@/lib/fx";
import { LEVELS, isCorrect, markBroken, readBroken, suggest, uniqueMemes, type Meme } from "@/lib/memes";
import { VOICES } from "@/lib/voices";

type Phase = "ready" | "playing" | "over";
type Flash = { id: number; kind: "right" | "wrong" | "skip"; text: string };

export const BLITZ_GAMES: Record<BlitzGameKey, { label: string; emoji: string; pool: Meme[]; placeholder: string }> = {
  memes: { label: "Memedle", emoji: "😂", pool: uniqueMemes(LEVELS), placeholder: "🔍 Welches Meme ist das?" },
  stimmen: { label: "Stimmdle", emoji: "🎬", pool: VOICES, placeholder: "🔍 Welcher Schauspieler ist das?" },
};

/** Blitz-Modus: 60 Sekunden, so viele Clips wie möglich. Serien geben Bonuspunkte, verkürzen aber den Ausschnitt. */
export function BlitzGame({ game, onBack }: { game: BlitzGameKey; onBack: () => void }) {
  const cfg = BLITZ_GAMES[game];
  const curve = BLITZ_CLIPS[game];
  const [phase, setPhase] = useState<Phase>("ready");
  const [ready, setReady] = useState(false);
  const [meme, setMeme] = useState<Meme>(cfg.pool[0]!);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(BLITZ_SECONDS);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [flash, setFlash] = useState<Flash | null>(null);
  const [shake, setShake] = useState(false);
  const [rounds, setRounds] = useState<BlitzRecord[]>([]);
  const [newRecord, setNewRecord] = useState(false);
  const [copied, setCopied] = useState(false);

  // Spielstand liegt zusätzlich in einer Ref, damit Timer und Handler nie mit altem Stand rechnen.
  const g = useRef({ score: 0, combo: 0, correct: 0, bestCombo: 0, used: new Set<string>(), meme: cfg.pool[0]!, endAt: 0, phase: "ready" as Phase });
  const player = useRef<any>(null);
  const box = useRef<HTMLDivElement>(null);
  const stopTimer = useRef<number | undefined>(undefined);
  const tick = useRef<number | undefined>(undefined);
  const flashTimer = useRef<number | undefined>(undefined);
  const onClipError = useRef<(code: number) => void>(() => {});
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setRounds(loadBlitz(game)); }, [game]);

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
    return () => {
      dead = true;
      window.clearInterval(tick.current); window.clearTimeout(stopTimer.current); window.clearTimeout(flashTimer.current);
      setReady(false);
      try { p?.destroy?.(); } catch {}
      if (box.current) box.current.innerHTML = "";
      player.current = null;
    };
  }, []);

  const showFlash = (kind: Flash["kind"], text: string) => {
    setFlash({ id: Date.now(), kind, text });
    window.clearTimeout(flashTimer.current);
    flashTimer.current = window.setTimeout(() => setFlash(null), 1500);
  };

  /** Ausschnitt laden und sofort abspielen (läuft im Klick, damit iPhones den Ton erlauben). */
  const playClip = (m: Meme) => {
    const p = player.current;
    if (!p) return;
    window.clearTimeout(stopTimer.current);
    const len = clipSeconds(curve, g.current.combo);
    p.loadVideoById({ videoId: m.yt, startSeconds: m.start ?? 0 });
    p.unMute?.(); p.setVolume?.(100);
    stopTimer.current = window.setTimeout(() => p.pauseVideo?.(), len * 1000 + 250);
  };

  const nextClip = () => {
    const d = drawNext(cfg.pool, g.current.used, readBroken());
    g.current.used = d.used; g.current.meme = d.meme;
    setMeme(d.meme);
    playClip(d.meme);
  };

  const replay = () => {
    const p = player.current;
    if (!p || g.current.phase !== "playing") return;
    window.clearTimeout(stopTimer.current);
    const len = clipSeconds(curve, g.current.combo);
    p.seekTo(g.current.meme.start ?? 0, true); p.unMute?.(); p.setVolume?.(100); p.playVideo();
    stopTimer.current = window.setTimeout(() => p.pauseVideo?.(), len * 1000 + 250);
  };

  onClipError.current = (code) => {
    if (![2, 100, 101, 150].includes(code) || g.current.phase !== "playing") return;
    const loaded = player.current?.getVideoData?.()?.video_id;
    if (loaded && loaded !== g.current.meme.yt) return;
    console.warn(`[Hördle] Clip nicht abspielbar: "${g.current.meme.name}" (${g.current.meme.yt}), Fehlercode ${code}`);
    markBroken(g.current.meme.yt);
    nextClip();
  };

  const finish = () => {
    if (g.current.phase !== "playing") return;
    g.current.phase = "over";
    window.clearInterval(tick.current); window.clearTimeout(stopTimer.current);
    player.current?.pauseVideo?.();
    const { score: s, correct: c, bestCombo: b } = g.current;
    const previous = loadBlitz(game);
    const updated = [...previous, { t: Date.now(), score: s, correct: c, bestCombo: b }];
    saveBlitz(game, updated);
    setRounds(updated);
    const record = isNewBlitzRecord(previous, s);
    setNewRecord(record);
    feedback(record ? "win" : "skip");
    setTimeLeft(0);
    setFlash(null);
    setPhase("over");
  };

  const start = () => {
    if (!ready) return;
    g.current = { ...g.current, score: 0, combo: 0, correct: 0, bestCombo: 0, used: new Set(), phase: "playing", endAt: Date.now() + BLITZ_SECONDS * 1000 };
    setScore(0); setCombo(0); setCorrect(0); setBestCombo(0); setTimeLeft(BLITZ_SECONDS);
    setInput(""); setFlash(null); setNewRecord(false); setCopied(false);
    setPhase("playing");
    nextClip();
    window.clearInterval(tick.current);
    tick.current = window.setInterval(() => {
      const left = Math.max(0, (g.current.endAt - Date.now()) / 1000);
      setTimeLeft(left);
      if (left <= 0) finish();
    }, 100);
    window.setTimeout(() => inputRef.current?.focus(), 50);
  };

  const suggestions = useMemo(() => suggest(input, cfg.pool), [input, cfg.pool]);
  const pick = () => (isCorrect(input, meme) ? input : suggestions[0]?.name ?? input);

  const answer = (text: string) => {
    const s = g.current;
    if (s.phase !== "playing" || !text.trim()) return;
    setInput(""); setOpen(false);
    if (isCorrect(text, s.meme)) {
      const pts = pointsFor(s.combo);
      s.score += pts; s.correct += 1; s.combo += 1; s.bestCombo = Math.max(s.bestCombo, s.combo);
      setScore(s.score); setCorrect(s.correct); setCombo(s.combo); setBestCombo(s.bestCombo);
      showFlash("right", `${s.meme.name}  +${pts}`);
      feedback("right", { sound: false, confettiCount: s.combo % 5 === 0 ? 70 : 0 });
      nextClip();
    } else {
      s.combo = 0; setCombo(0);
      showFlash("wrong", text);
      setShake(true); window.setTimeout(() => setShake(false), 450);
      feedback("wrong", { sound: false });
    }
  };

  const skip = () => {
    const s = g.current;
    if (s.phase !== "playing") return;
    s.combo = 0; setCombo(0);
    showFlash("skip", `Das war: ${s.meme.name}`);
    feedback("skip", { sound: false });
    nextClip();
  };

  const share = async () => {
    const text = blitzShareText(cfg.label, score, correct, bestCombo, `${window.location.origin}/blitz`);
    try {
      if (navigator.share) await navigator.share({ title: `${cfg.label}-Blitz`, text });
      else { await navigator.clipboard.writeText(text); setCopied(true); }
    } catch { /* Ein abgebrochener Teilen-Dialog verändert nichts. */ }
  };

  const best = blitzBest(rounds);
  const clipLen = clipSeconds(curve, combo);
  const flashTone = flash?.kind === "right" ? "border-primary bg-primary/15 text-primary" : flash?.kind === "wrong" ? "border-destructive/60 text-destructive" : "border-border text-muted-foreground";

  const back = (
    <button onClick={onBack} className="mb-4 inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold transition hover:border-primary">
      <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Anderes Spiel wählen
    </button>
  );

  return (
    <>
      <div ref={box} className="pointer-events-none fixed -left-10 top-0 h-px w-px opacity-0" />
      <main className="mx-auto flex min-h-screen max-w-md flex-col px-4 pb-10 pt-6">
        {phase !== "playing" && back}
        <header className="mb-4 flex items-center justify-between border-b border-border pb-4">
          <h1 className="text-3xl font-extrabold tracking-tight">⚡ <span className="text-primary">Blitz</span></h1>
          <p className="text-right text-sm font-bold">{cfg.emoji} {cfg.label}{best > 0 && <span className="block text-xs font-semibold text-muted-foreground">🏆 Rekord {best.toLocaleString("de-DE")}</span>}</p>
        </header>

        {phase === "ready" && (
          <section className="space-y-4">
            <ul className="space-y-2 rounded-2xl border border-border bg-card p-4 text-sm">
              <li>⏱️ <strong>{BLITZ_SECONDS} Sekunden</strong> – erkenne so viele Clips wie möglich.</li>
              <li>🎯 Jeder Treffer gibt <strong>100 Punkte</strong>, plus <strong>50 für jeden Treffer in Folge</strong> (bis +500).</li>
              <li>🔥 Je länger deine Serie, desto <strong>kürzer wird der Ausschnitt</strong>.</li>
              <li>✕ Falsch oder überspringen setzt die Serie zurück.</li>
            </ul>
            <button onClick={start} disabled={!ready} className="w-full rounded-xl bg-primary py-4 text-xl font-extrabold text-primary-foreground shadow-glow transition active:scale-95 disabled:opacity-40">
              {ready ? "Los! ⚡" : "Lädt …"}
            </button>
            <p className="text-center text-xs text-muted-foreground">Ton anmachen! Beim iPhone den Stummschalter-Schalter prüfen.</p>
          </section>
        )}

        {phase === "playing" && (
          <>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Punkte</p>
                <p className="text-4xl font-extrabold tabular-nums text-primary">{score.toLocaleString("de-DE")}</p>
              </div>
              <div className="text-right">
                <p className={`text-4xl font-extrabold tabular-nums ${timeLeft <= 10 ? "text-destructive" : ""}`} aria-label="Verbleibende Sekunden">{Math.ceil(timeLeft)}s</p>
                <p className="text-xs text-muted-foreground">{combo > 0 ? `🔥 Serie ${combo}` : "Serie 0"} · nächster Treffer +{pointsFor(combo)}</p>
              </div>
            </div>
            <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuemin={0} aria-valuemax={BLITZ_SECONDS} aria-valuenow={Math.ceil(timeLeft)}>
              <div className={`h-full transition-[width] duration-100 ease-linear ${timeLeft <= 10 ? "bg-destructive" : "bg-primary"}`} style={{ width: `${(timeLeft / BLITZ_SECONDS) * 100}%` }} />
            </div>

            <div className="mt-4 flex h-12 items-center justify-center" role="status" aria-live="polite">
              {flash && <p key={flash.id} className={`fx-pop max-w-full truncate rounded-lg border px-4 py-2 text-sm font-bold ${flashTone}`}>{flash.kind === "right" ? "✓ " : flash.kind === "wrong" ? "✕ " : "⏭ "}{flash.text}</p>}
            </div>

            <button onClick={replay} aria-label="Ausschnitt nochmal abspielen"
              className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary text-4xl text-primary-foreground shadow-glow transition active:scale-95">
              ▶
            </button>
            <p className="mt-2 text-center text-xs text-muted-foreground">Ausschnitt {clipLen}s · tippe zum Wiederholen</p>

            <div className={`relative mt-5 ${shake ? "fx-shake" : ""}`}>
              {open && suggestions.length > 0 && (
                <ul className="absolute bottom-full mb-2 w-full overflow-hidden rounded-xl border border-border bg-popover">
                  {suggestions.map((m) => (
                    <li key={m.name}>
                      <button className="w-full px-4 py-2.5 text-left text-sm hover:bg-secondary" onMouseDown={(e) => e.preventDefault()} onClick={() => answer(m.name)}>{m.name}</button>
                    </li>
                  ))}
                </ul>
              )}
              <input ref={inputRef} value={input} onChange={(e) => { setInput(e.target.value); setOpen(true); }}
                onKeyDown={(e) => e.key === "Enter" && answer(pick())}
                placeholder={cfg.placeholder} autoComplete="off" autoCapitalize="off" enterKeyHint="send"
                className="w-full rounded-xl border border-input bg-card px-4 py-3 outline-none focus:border-ring" />
              <div className="mt-3 flex gap-2">
                <button onClick={skip} className="flex-1 rounded-xl bg-secondary py-3 font-semibold text-secondary-foreground">Überspringen</button>
                <button onClick={() => answer(pick())} className="flex-1 rounded-xl bg-primary py-3 font-bold text-primary-foreground">Raten</button>
              </div>
            </div>
          </>
        )}

        {phase === "over" && (
          <section className="space-y-4" data-testid="blitz-result">
            <div className="rounded-2xl border-2 border-primary/40 bg-card p-5 text-center shadow-glow">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Zeit abgelaufen</p>
              <p className="mt-1 text-6xl font-extrabold tabular-nums text-primary">{score.toLocaleString("de-DE")}</p>
              <p className="mt-2 text-lg font-bold">{blitzRank(score)}</p>
              {newRecord && <p className="mt-3 rounded-lg bg-primary/15 px-3 py-1.5 text-sm font-extrabold text-primary">🏆 Neuer Rekord!</p>}
            </div>
            <dl className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl border border-border bg-card p-3"><dd className="text-2xl font-extrabold">{correct}</dd><dt className="text-[11px] text-muted-foreground">erkannt</dt></div>
              <div className="rounded-xl border border-border bg-card p-3"><dd className="text-2xl font-extrabold">{bestCombo}</dd><dt className="text-[11px] text-muted-foreground">beste Serie</dt></div>
              <div className="rounded-xl border border-border bg-card p-3"><dd className="text-2xl font-extrabold text-primary">{best.toLocaleString("de-DE")}</dd><dt className="text-[11px] text-muted-foreground">Rekord</dt></div>
            </dl>
            <button onClick={share} className="w-full rounded-xl bg-secondary py-3 font-bold text-secondary-foreground">{copied ? "Text kopiert!" : "⚡ Ergebnis teilen"}</button>
            <button onClick={() => { g.current.phase = "ready"; setPhase("ready"); }} className="w-full rounded-xl bg-primary py-3 font-bold text-primary-foreground">Nochmal</button>
          </section>
        )}
      </main>
    </>
  );
}
