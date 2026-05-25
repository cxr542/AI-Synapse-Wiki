import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const entriesPath = path.resolve("src/data/entries.json");

describe("entries.json", () => {
  it("includes PoC hub and story with synapse routes", () => {
    const data = JSON.parse(readFileSync(entriesPath, "utf8")) as {
      entries: Array<{ kind: string; slug: string; route: string; related?: unknown[] }>;
    };
    const teddynote = data.entries.find(
      (e) => e.kind === "hubs" && e.slug === "teddynote",
    );
    const story = data.entries.find(
      (e) => e.kind === "stories" && e.slug === "llm-marketing-pipeline",
    );
    expect(teddynote?.route).toBe("/hubs/teddynote");
    expect(story?.route).toBe("/stories/llm-marketing-pipeline");
    expect(teddynote?.related?.length).toBeGreaterThan(0);
    expect(story?.related?.length).toBeGreaterThan(0);
  });

  it("assigns visibility per kind defaults", () => {
    const data = JSON.parse(readFileSync(entriesPath, "utf8")) as {
      entries: Array<{ kind: string; slug: string; visibility?: string }>;
    };
    const topic = data.entries.find(
      (e) => e.kind === "topics" && e.slug === "harness-engineering",
    );
    const hub = data.entries.find(
      (e) => e.kind === "hubs" && e.slug === "teddynote",
    );
    const story = data.entries.find(
      (e) => e.kind === "stories" && e.slug === "llm-marketing-pipeline",
    );
    expect(topic?.visibility).toBe("published");
    expect(hub?.visibility).toBe("admin");
    expect(story?.visibility).toBe("draft");
  });

  it("has minimum migrated counts per plan Phase 2", () => {
    const data = JSON.parse(readFileSync(entriesPath, "utf8")) as {
      entries: Array<{ kind: string; slug: string }>;
    };
    const hubs = data.entries.filter((e) => e.kind === "hubs" && e.slug !== "_index");
    const stories = data.entries.filter((e) => e.kind === "stories" && e.slug !== "_index");
    const topics = data.entries.filter((e) => e.kind === "topics");
    expect(hubs.length).toBeGreaterThanOrEqual(4);
    expect(stories.length).toBeGreaterThanOrEqual(3);
    expect(topics.length).toBeGreaterThanOrEqual(2);
  });
});
