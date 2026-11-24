export type ShareAttempt = "wrong" | "skip" | "right";

const SYMBOLS: Record<ShareAttempt, string> = {
  wrong: "🟥",
  skip: "⬜",
  right: "🟩",
};

export function resultGrid(results: { kinds: ShareAttempt[] }[], slots = 6) {
  return results.map((result) => {
    const cells = result.kinds.slice(0, slots).map((kind) => SYMBOLS[kind]);
    while (cells.length < slots) cells.push("⬛");
    return cells.join("");
  });
}
