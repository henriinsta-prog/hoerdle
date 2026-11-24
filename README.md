# Hördle – Memedle & Stimmdle

Ratespiele im Wordle-Stil: Aus einem winzigen Audio-Ausschnitt erkennen.

- **Memedle** – deutsche Memes am Sound erkennen
- **Stimmdle** – Schauspieler an der Stimme erkennen. Alle Stufen ziehen aus einem Pool gleich bekannter Schauspieler, die Schwierigkeit kommt nur aus der Clip-Länge (Stufe 5 startet bei 0,1 s, siehe `VOICE_CLIPS`)
- 5 Stufen pro Runde, Punkte, Emoji-Ergebnis zum Teilen
- **Duell-Links**: Freunde spielen exakt dieselben fünf Sounds (`?duell=...&p=<Punkte>&n=<Name>`) und sehen am Ende den Vergleich mit Sieger und Rückduell-Link
- **Statistik auf dem Gerät**: Rekord, Ø der letzten 10 Runden, Versuchsverteilung (nur im Browser gespeichert, `src/lib/stats.ts`)
- **Blitz-Modus** (`/blitz`): 60 Sekunden, Serien-Bonus, Ausschnitt wird mit der Serie kürzer, eigener Rekord (`src/lib/blitz.ts`, `src/components/BlitzGame.tsx`)
- **Spielgefühl**: Konfetti, Vibration, kurze Töne und Animationen, im Menü abschaltbar (`src/lib/fx.ts`)
- **Live-Duelle** (fertig gebaut, noch gesperrt): Raumcode, Lobby, Live-Rangliste, Siegerkrone

## Lokal starten

```sh
npm install
npm run dev      # Entwicklung
npm test         # Tests
npm run build    # Produktions-Build
```

## Link-Vorschau (WhatsApp, Discord, …)

Jede Seite liefert ein Vorschaubild (`public/og-image.png`, 1200×630) und Meta-Angaben (`src/lib/share-meta.ts`). Bei Duell-Links steht die Herausforderung schon im Titel („⚔️ Henri fordert dich heraus – 820 Punkte“).
**Wichtig:** Nach dem Veröffentlichen die Adresse der Seite in `src/lib/site.ts` bei `SITE_URL` eintragen, sonst zeigen manche Chat-Apps das Bild nicht an.

## Als App auf den Startbildschirm

`public/manifest.webmanifest`, die Icons in `public/` (`icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, `apple-touch-icon.png`) und die Meta-Angaben in `src/routes/__root.tsx` machen die Seite installierbar. Im Menü zeigt `src/components/InstallHint.tsx` auf Android/Computer einen Installieren-Knopf und auf iPhone/iPad eine Anleitung („Teilen → Zum Home-Bildschirm“). Kein Offline-Modus: Die Sounds kommen von YouTube.

## Aufbau

- `src/lib/memes.ts`, `src/lib/voices.ts` – Kataloge (YouTube-IDs, Startzeit, Aliasse)
- `src/components/GuessGame.tsx` – das Spiel
- `src/routes/` – Menü (`/`), `/memes`, `/stimmen`

## Live-Duelle freischalten

Oberfläche und Logik sind fertig (`src/components/LiveDuel.tsx`, `src/lib/live-duel.ts`), das Menüfeld ist aber per Schalter gesperrt: `LIVE_DUELS_ENABLED` in `src/lib/features.ts`.
Mitgeliefert ist nur ein Transport für Fenster im selben Browser. Für Spieler auf verschiedenen Geräten braucht es einen Server-Transport (z. B. Realtime-Kanal), der das Interface `LiveTransport` erfüllt. Danach in `LiveDuel.tsx` `createLocalTransport` ersetzen und den Schalter auf `true` setzen.

## Neue Schauspieler-Clips prüfen

`public/clip-pruefer.html` (läuft unter `/clip-pruefer.html`) ist eine Hilfsseite: Kandidat wählen, Startsekunde einstellen, 16 Sekunden und die kurzen Stufe-5-Proben anhören, Einbettbarkeit wird automatisch geprüft. Am Ende kopierst du die fertige Zeile in `VOICES` in `src/lib/voices.ts`. Die Kandidatenliste steht oben in der Datei.

Neue Clips: Eintrag in der passenden Stufe ergänzen (`yt` = YouTube-ID, optional `start`, `aliases`).

Gebaut mit [Lovable](https://lovable.dev); der Code gehört dir.
