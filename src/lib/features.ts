/**
 * Schalter für Funktionen, die fertig gebaut, aber noch nicht freigegeben sind.
 *
 * Live-Duelle: Oberfläche und Logik sind fertig. Freischalten (`true`) erst, wenn
 * ein Server-Transport für Spieler auf verschiedenen Geräten angeschlossen ist
 * (siehe src/lib/live-duel.ts). Solange der Schalter aus ist, bleibt das Menüfeld
 * nicht klickbar und /live zeigt nur „Bald verfügbar“.
 */
export const LIVE_DUELS_ENABLED = false;
