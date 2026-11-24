import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { BLITZ_GAMES, BlitzGame } from "@/components/BlitzGame";
import { BLITZ_SECONDS, blitzBest, loadBlitz, type BlitzGameKey } from "@/lib/blitz";
import { shareMeta } from "@/lib/share-meta";

export const Route = createFileRoute("/blitz")({
  head: () => ({
    meta: shareMeta({
      title: "Blitz-Modus – Hördle",
      description: `${BLITZ_SECONDS} Sekunden, so viele Memes oder Stimmen wie möglich. Schlag deinen Rekord!`,
    }),
  }),
  component: BlitzPage,
});

function BlitzPage() {
  const [game, setGame] = useState<BlitzGameKey | null>(null);
  const [bests, setBests] = useState<Partial<Record<BlitzGameKey, number>>>({});

  // Rekorde liegen im Browser; erst nach dem Laden lesen und nach jedem Spiel neu.
  useEffect(() => {
    setBests({ memes: blitzBest(loadBlitz("memes")), stimmen: blitzBest(loadBlitz("stimmen")) });
  }, [game]);

  if (game) return <BlitzGame key={game} game={game} onBack={() => setGame(null)} />;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10">
      <Link to="/" className="mb-6 inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold transition hover:border-primary">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Zurück zum Menü
      </Link>
      <h1 className="text-center text-4xl font-extrabold tracking-tight">⚡ <span className="text-primary">Blitz</span></h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">{BLITZ_SECONDS} Sekunden, so viele wie möglich. Wähle dein Spiel:</p>
      <div className="mt-8 space-y-4">
        {(Object.keys(BLITZ_GAMES) as BlitzGameKey[]).map((k) => (
          <button key={k} onClick={() => setGame(k)} className="flex w-full items-center gap-4 rounded-2xl border-2 border-border bg-card p-5 text-left transition hover:border-primary active:scale-[0.98]">
            <span className="text-4xl">{BLITZ_GAMES[k].emoji}</span>
            <span>
              <span className="block text-xl font-extrabold">{BLITZ_GAMES[k].label}</span>
              <span className="block text-sm text-muted-foreground">{k === "memes" ? "Memes im Sekundentakt erkennen" : "Schauspieler-Stimmen im Sekundentakt"}</span>
              {(bests[k] ?? 0) > 0 && <span className="mt-1 block text-xs font-semibold text-primary">🏆 Rekord {bests[k]!.toLocaleString("de-DE")}</span>}
            </span>
          </button>
        ))}
      </div>
    </main>
  );
}
