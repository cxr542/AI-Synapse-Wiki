/**
 * Dev-only admin UI settings (protect mode toggle, etc.)
 */
import fs from "node:fs";
import path from "node:path";
import { wikiRoot } from "./admin-api-handlers.mjs";

const FILE = ".wiki-admin-settings.json";

/** @param {string} [root] */
export function settingsPath(root = wikiRoot()) {
  return path.join(root, FILE);
}

/** @param {string} [root] */
export function readAdminSettings(root = wikiRoot()) {
  try {
    const raw = fs.readFileSync(settingsPath(root), "utf8");
    const data = JSON.parse(raw);
    return typeof data === "object" && data !== null ? data : {};
  } catch {
    return {};
  }
}

/**
 * @param {boolean} enabled
 * @param {string} [root]
 */
export function writeProtectMode(enabled, root = wikiRoot()) {
  const prev = readAdminSettings(root);
  const next = { ...prev, protectMode: Boolean(enabled) };
  fs.writeFileSync(
    settingsPath(root),
    `${JSON.stringify(next, null, 2)}\n`,
    "utf8",
  );
  return next;
}
