import type { CSSProperties } from "react";

/** Eigene Akzentfarbe pro Spiel: Memedle orange, Stimmdle pink-violett, Blitz gelb. */
export type ThemeKey = "memes" | "stimmen" | "blitz";

export const THEME_COLORS: Record<ThemeKey, string> = {
  memes: "oklch(0.82 0.17 62)",
  stimmen: "oklch(0.76 0.17 330)",
  blitz: "oklch(0.92 0.18 100)",
};

/** Überschreibt die Hauptfarbe nur für den umschlossenen Bereich; Tailwind-Klassen wie text-primary übernehmen sie. */
export function themeStyle(key: ThemeKey | null | undefined): CSSProperties | undefined {
  if (!key) return undefined;
  const c = THEME_COLORS[key];
  return { "--primary": c, "--ring": c, "--primary-foreground": "oklch(0.18 0.04 150)" } as CSSProperties;
}

/** Aus dem Speicherschlüssel des Spiels die passende Farbe wählen (Memedle/Stimmdle) */
export function themeForStorageKey(storageKey: string): ThemeKey | null {
  if (storageKey.startsWith("memedle")) return "memes";
  if (storageKey.startsWith("stimmdle")) return "stimmen";
  return null;
}
