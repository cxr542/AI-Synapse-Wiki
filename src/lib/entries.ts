import type { EntriesBundle, EntryKind, WikiEntry } from "./types";
import { isUserVisible } from "./visibility";
import bundle from "../data/entries.json";

const data = bundle as EntriesBundle;

function visible(entries: WikiEntry[]): WikiEntry[] {
  return entries.filter(isUserVisible);
}

export function getAllEntries(): WikiEntry[] {
  return data.entries;
}

export function getPublishedEntries(): WikiEntry[] {
  return visible(data.entries);
}

export function getEntry(kind: EntryKind, slug: string): WikiEntry | undefined {
  return data.entries.find((e) => e.kind === kind && e.slug === slug);
}

export function getPublishedEntry(
  kind: EntryKind,
  slug: string,
): WikiEntry | undefined {
  const e = getEntry(kind, slug);
  return e && isUserVisible(e) ? e : undefined;
}

export function getByKind(kind: EntryKind): WikiEntry[] {
  return data.entries.filter((e) => e.kind === kind && e.slug !== "_index");
}

/** 제목 기준 오름차순 (한·영 혼합) */
export function compareEntryTitle(a: WikiEntry, b: WikiEntry): number {
  return a.title.localeCompare(b.title, "ko", { sensitivity: "base" });
}

export function getByKindSorted(kind: EntryKind): WikiEntry[] {
  return [...getByKind(kind)].sort(compareEntryTitle);
}

export function getPublishedByKind(kind: EntryKind): WikiEntry[] {
  return visible(getByKind(kind));
}

export function getPublishedByKindSorted(kind: EntryKind): WikiEntry[] {
  return visible(getByKindSorted(kind));
}

export function getHome(): WikiEntry | undefined {
  return data.entries.find((e) => e.kind === "home");
}

export function getCategoryIndex(kind: EntryKind): WikiEntry | undefined {
  return data.entries.find((e) => e.kind === kind && e.slug === "_index");
}

export function searchEntries(query: string, publishedOnly = false): WikiEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const pool = publishedOnly ? getPublishedEntries() : data.entries;
  return pool.filter((e) => {
    if (e.kind === "home" || e.slug === "_index") return false;
    const hay = [
      e.title,
      e.body ?? "",
      ...(e.tags ?? []),
      e.source_url ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return hay.includes(q);
  });
}

export function resolveRelated(
  entry: WikiEntry,
  publishedOnly = false,
): WikiEntry[] {
  if (!entry.related?.length) return [];
  return entry.related
    .map((r) => getEntry(r.kind, r.slug))
    .filter((e): e is WikiEntry => {
      if (!e) return false;
      return publishedOnly ? isUserVisible(e) : true;
    });
}

export const generatedAt = data.generatedAt;
