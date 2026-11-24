import { createFileRoute } from "@tanstack/react-router";
import { GuessGame } from "@/components/GuessGame";
import { parseDuelSearch, searchFromHeadContext, shareMeta, type DuelSearch } from "@/lib/share-meta";
import { VOICE_CLIPS, VOICE_LEVELS } from "@/lib/voices";

export const Route = createFileRoute("/stimmen")({
  validateSearch: (search: Record<string, unknown>): DuelSearch => parseDuelSearch(search),
  head: (ctx) => ({
    meta: shareMeta(
      { title: "Stimmdle – Errate den Schauspieler", description: "Hör kurz rein – erkennst du den Schauspieler an seiner Stimme?" },
      searchFromHeadContext(ctx),
    ),
  }),
  component: () => <GuessGame levels={VOICE_LEVELS} storageKey="stimmdle-seen" title={["Stimm", "dle"]} placeholder="🔍 Welcher Schauspieler ist das?" clips={VOICE_CLIPS} />,
});
