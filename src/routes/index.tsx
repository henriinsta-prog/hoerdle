import { createFileRoute, Link } from "@tanstack/react-router";
import { FxToggle } from "@/components/FxToggle";
import { InstallHint } from "@/components/InstallHint";
import { Logo } from "@/components/Logo";
import { themeStyle, type ThemeKey } from "@/lib/game-theme";
import { activeCount, dayKey, loadStreak } from "@/lib/streak";
import { LIVE_DUELS_ENABLED } from "@/lib/features";
import { useEffect, useState } from "react";
import { shareMeta } from "@/lib/share-meta";
import { loadRounds, statsKey, summarize } from "@/lib/stats";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: shareMeta({
      title: "Hördle – Memes & Stimmen erraten",
      description: "Erkenne Memes und Schauspieler-Stimmen an einem winzigen Ausschnitt und fordere deine Freunde mit exakt derselben Runde heraus.",
    }),
  }),
  component: Menu,
});

const GAMES = [
  { to: "/memes" as const, emoji: "😂", title: "Memedle", text: "Erkenne deutsche Memes am Sound", storageKey: "memedle-seen", theme: "memes" as ThemeKey },
  { to: "/stimmen" as const, emoji: "🎬", title: "Stimmdle", text: "Schauspieler-Stimmen erkennen", storageKey: "stimmdle-seen", theme: "stimmen" as ThemeKey },
];

function Menu() {
  // Rekorde liegen im Browser; erst nach dem Laden lesen, damit Server und Browser dasselbe zeigen.
  const [records, setRecords] = useState<Record<string, { best: number; played: number }>>({});
  const [streak, setStreak] = useState<{ count: number; best: number; today: boolean } | null>(null);
  useEffect(() => {
    const s = loadStreak(), today = dayKey();
    setStreak({ count: activeCount(s, today), best: s?.best ?? 0, today: s?.last === today });
    setRecords(Object.fromEntries(GAMES.map((g) => {
      const s = summarize(loadRounds(statsKey(g.storageKey)));
      return [g.storageKey, { best: s.best, played: s.played }];
    })));
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <Logo />
      <p className="mt-2 text-center text-sm text-muted-foreground">Wähle dein Spiel</p>
      {streak && streak.count > 0 && (
        <div className="mt-4 text-center">
          <span className="inline-block rounded-full border border-accent/40 bg-accent/10 px-4 py-1.5 text-sm font-bold text-accent">
            🔥 {streak.count} {streak.count === 1 ? "Tag" : "Tage"} in Folge
          </span>
          <p className="mt-1 text-xs text-muted-foreground">
            {streak.today ? "Heute schon gespielt ✓" : "Spiel heute eine Runde, damit die Serie bleibt"}
            {streak.best > streak.count ? ` · Rekord ${streak.best} Tage` : ""}
          </p>
        </div>
      )}
      <div className="mt-8 space-y-4">
        {GAMES.map((g) => (
          <Link key={g.to} to={g.to} style={themeStyle(g.theme)} className="flex items-center gap-4 rounded-2xl border-2 border-border bg-card p-5 transition hover:border-primary active:scale-[0.98]">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary/15 text-3xl">{g.emoji}</span>
            <span>
              <span className="block text-xl font-extrabold">{g.title}</span>
              <span className="block text-sm text-muted-foreground">{g.text}</span>
              {(records[g.storageKey]?.played ?? 0) > 0 && (
                <span className="mt-1 block text-xs font-semibold text-primary">
                  🏆 Rekord {records[g.storageKey]!.best.toLocaleString("de-DE")} · {records[g.storageKey]!.played} {records[g.storageKey]!.played === 1 ? "Runde" : "Runden"}
                </span>
              )}
            </span>
          </Link>
        ))}
        <Link to="/blitz" style={themeStyle("blitz")} className="flex items-center gap-4 rounded-2xl border-2 border-primary/50 bg-primary/5 p-5 transition hover:border-primary active:scale-[0.98]">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-primary/15 text-3xl">⚡</span>
          <span>
            <span className="block text-xl font-extrabold">Blitz-Modus</span>
            <span className="block text-sm text-muted-foreground">60 Sekunden, so viele wie möglich – mit Serien-Bonus</span>
          </span>
        </Link>
      </div>
      <div className="mt-6 rounded-xl border border-primary/30 bg-primary/5 p-3 text-center">
        <p className="text-sm font-bold">⚔️ Neu: Duell-Modus</p>
        <p className="mt-1 text-xs text-muted-foreground">Nach jeder Runde Freunde mit exakt denselben fünf Sounds herausfordern – inklusive deinem Punktestand und Sieger-Vergleich.</p>
      </div>
      {LIVE_DUELS_ENABLED ? (
        <Link to="/live" className="mt-3 block rounded-xl border-2 border-primary/40 bg-card p-3 text-center transition hover:border-primary active:scale-[0.98]">
          <p className="text-sm font-extrabold">🔴 Live-Duelle</p>
          <p className="mt-1 text-xs text-muted-foreground">Gleichzeitig gegen deine Freunde spielen – mit Live-Punkten und Siegerkrone.</p>
        </Link>
      ) : (
        <div aria-disabled="true" className="mt-3 select-none rounded-xl border border-dashed border-border bg-card/50 p-3 text-center opacity-70">
          <p className="text-xs font-extrabold uppercase tracking-widest">Soon: Live-Duelle</p>
          <p className="mt-1 text-xs text-muted-foreground">Gleichzeitig gegen deine Freunde spielen – mit Live-Punkten und Siegerkrone.</p>
        </div>
      )}
      <InstallHint />
      <div className="mt-4 flex justify-center"><FxToggle /></div>
      <footer className="mt-6 text-center text-xs text-muted-foreground">
        <p>@henri.mr0</p>
        <div className="mt-1 flex justify-center gap-2">
          <a href="https://www.instagram.com/henri.mr0" target="_blank" rel="noreferrer" className="underline-offset-4 transition hover:text-primary hover:underline">Instagram</a>
          <span aria-hidden="true">·</span>
          <a href="https://www.tiktok.com/@henri.mr0" target="_blank" rel="noreferrer" className="underline-offset-4 transition hover:text-primary hover:underline">TikTok</a>
        </div>
        <p className="mt-3 text-[11px] opacity-80">
          Meme-Vorschläge? Schreib mir auf{" "}
          <a href="https://www.instagram.com/henri.mr0" target="_blank" rel="noreferrer" className="underline underline-offset-4 transition hover:text-primary">Instagram</a>.
        </p>
      </footer>
    </main>
  );
}
