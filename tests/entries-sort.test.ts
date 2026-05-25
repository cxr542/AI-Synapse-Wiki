import { describe, expect, it } from "vitest";
import { compareEntryTitle } from "../src/lib/entries";
import type { WikiEntry } from "../src/lib/types";

function topic(title: string): WikiEntry {
  return {
    kind: "topics",
    slug: "x",
    route: "/topics/x",
    title,
  };
}

describe("compareEntryTitle", () => {
  it("sorts Korean and Latin titles ascending", () => {
    const items = [
      topic("ChatGPT"),
      topic("Google Gemini"),
      topic("Claude Code"),
      topic("Harness Engineering"),
    ].sort(compareEntryTitle);
    expect(items).toHaveLength(4);
    for (let i = 1; i < items.length; i++) {
      expect(compareEntryTitle(items[i - 1], items[i])).toBeLessThanOrEqual(0);
    }
  });
});
