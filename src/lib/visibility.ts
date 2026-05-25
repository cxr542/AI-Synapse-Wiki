import type { Visibility, WikiEntry } from "./types";

export function isUserVisible(entry: WikiEntry): boolean {
  if (entry.kind === "home") return true;
  if (entry.slug === "_index") return false;
  if (entry.kind === "inbox") return false;
  return entry.visibility === "published";
}

export function defaultVisibility(
  kind: WikiEntry["kind"],
): Visibility | undefined {
  if (kind === "topics") return "published";
  if (kind === "stories") return "draft";
  if (kind === "hubs") return "admin";
  if (kind === "inbox") return "admin";
  return undefined;
}
