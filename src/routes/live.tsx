import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { LiveDuel } from "@/components/LiveDuel";
import { LIVE_DUELS_ENABLED } from "@/lib/features";
import { shareMeta } from "@/lib/share-meta";

export const Route = createFileRoute("/live")({
  head: () => ({
    meta: shareMeta({ title: "Live-Duell – Hördle", description: "Spiel gleichzeitig gegen deine Freunde – mit Live-Punkten und Siegerkrone." }),
  }),
  component: LivePage,
});

function LivePage() {
  if (LIVE_DUELS_ENABLED) return <LiveDuel />;
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-10 text-center">
      <p className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground">Soon</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Live-<span className="text-primary">Duelle</span></h1>
      <p className="mt-3 text-sm text-muted-foreground">Gleichzeitig gegen deine Freunde spielen – mit Live-Punkten und Siegerkrone. Kommt bald!</p>
      <Link to="/" className="mx-auto mt-6 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold transition hover:border-primary">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Zurück zum Menü
      </Link>
    </main>
  );
}
