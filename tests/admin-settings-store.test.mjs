import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  readAdminSettings,
  writeProtectMode,
} from "../scripts/admin-settings-store.mjs";
import {
  isProtectMode,
  resolveProtectMode,
  setProtectModeSetting,
} from "../scripts/admin-env.mjs";

describe("admin-settings-store", () => {
  it("writes protectMode to .wiki-admin-settings.json", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wiki-admin-"));
    writeProtectMode(true, tmp);
    expect(readAdminSettings(tmp).protectMode).toBe(true);
    writeProtectMode(false, tmp);
    expect(readAdminSettings(tmp).protectMode).toBe(false);
  });

  it("resolveProtectMode uses file when env off", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wiki-admin-"));
    writeProtectMode(true, tmp);
    const env = {};
    expect(resolveProtectMode(env, tmp)).toEqual({
      protectMode: true,
      protectLocked: false,
      protectFromFile: true,
    });
    expect(isProtectMode(env, tmp)).toBe(true);
  });

  it("env lock overrides file off", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wiki-admin-"));
    writeProtectMode(false, tmp);
    const env = { VITE_ADMIN_PROTECT: "true" };
    expect(resolveProtectMode(env, tmp).protectMode).toBe(true);
    expect(resolveProtectMode(env, tmp).protectLocked).toBe(true);
  });

  it("setProtectModeSetting rejects when env locked", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wiki-admin-"));
    expect(() =>
      setProtectModeSetting(false, { VITE_ADMIN_PROTECT: "true" }, tmp),
    ).toThrow(/VITE_ADMIN_PROTECT/);
  });
});
