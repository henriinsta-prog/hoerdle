import { createFileRoute } from "@tanstack/react-router";
import { GuessGame } from "@/components/GuessGame";
import { LEVELS } from "@/lib/memes";
import { parseDuelSearch, searchFromHeadContext, shareMeta, type DuelSearch } from "@/lib/share-meta";

export const Route = createFileRoute("/memes")({
  validateSearch: (search: Record<string, unknown>): DuelSearch => parseDuelSearch(search),
  head: (ctx) => ({
    meta: shareMeta(
      { title: "Memedle – Errate das Meme", description: "Hör den ersten Bruchteil einer Sekunde – erkennst du den Meme-Sound?" },
      searchFromHeadContext(ctx),
    ),
  }),
  component: () => <GuessGame levels={LEVELS} storageKey="memedle-seen" title={["Meme", "dle"]} placeholder="🔍 Welches Meme ist das?" />,
});
