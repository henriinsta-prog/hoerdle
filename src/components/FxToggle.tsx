import { useEffect, useState } from "react";
import { fxEnabled, haptic, setFxEnabled } from "@/lib/fx";

/** Schalter für Konfetti, Vibration und Töne. */
export function FxToggle() {
  const [on, setOn] = useState(true);
  useEffect(() => { setOn(fxEnabled()); }, []);
  const toggle = () => {
    const next = !on;
    setFxEnabled(next);
    setOn(next);
    if (next) haptic("right");
  };
  return (
    <button onClick={toggle} aria-pressed={on} className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold transition hover:border-primary">
      ✨ Effekte &amp; Töne: {on ? "an" : "aus"}
    </button>
  );
}
