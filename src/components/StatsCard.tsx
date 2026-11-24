import { summarize, type RoundRecord } from "@/lib/stats";

const fmt = (n: number) => n.toLocaleString("de-DE");

/** Statistik am Rundenende: Rekord, Durchschnitt, gespielte Runden und Versuchsverteilung. */
export function StatsCard({ rounds, newRecord }: { rounds: RoundRecord[]; newRecord: boolean }) {
  const s = summarize(rounds);
  const max = Math.max(1, s.unsolved, ...s.distribution);
  const rows = [
    ...s.distribution.map((count, i) => ({ label: `${i + 1}`, count, tone: "bg-primary" })),
    { label: "✕", count: s.unsolved, tone: "bg-destructive/70" },
  ];
  return (
    <section aria-label="Deine Statistik" className="mt-4 rounded-2xl border border-border bg-card p-4" data-testid="stats-card">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Deine Statistik</p>
      {newRecord && <p className="mt-2 rounded-lg bg-primary/15 px-3 py-1.5 text-center text-sm font-extrabold text-primary">🏆 Neuer Rekord!</p>}
      <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div><dd className="text-2xl font-extrabold text-primary">{fmt(s.best)}</dd><dt className="text-[11px] text-muted-foreground">Rekord</dt></div>
        <div><dd className="text-2xl font-extrabold">{fmt(s.avgLast10)}</dd><dt className="text-[11px] text-muted-foreground">Ø letzte 10</dt></div>
        <div><dd className="text-2xl font-extrabold">{fmt(s.played)}</dd><dt className="text-[11px] text-muted-foreground">{s.played === 1 ? "Runde" : "Runden"}</dt></div>
      </dl>
      <p className="mt-4 text-xs font-semibold text-muted-foreground">Versuche bis zur Lösung (✕ = nicht gelöst)</p>
      <ul className="mt-2 space-y-1">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center gap-2 text-xs">
            <span className="w-4 text-center font-semibold text-muted-foreground">{r.label}</span>
            <span className="h-4 flex-1 overflow-hidden rounded bg-muted">
              <span className={`block h-full rounded ${r.tone}`} style={{ width: r.count ? `${Math.max(6, (r.count / max) * 100)}%` : "0%" }} />
            </span>
            <span className="w-8 text-right tabular-nums">{r.count}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
