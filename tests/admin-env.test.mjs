import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  checkAdminRequest,
  checkDeleteAllowed,
  getAdminEnv,
  isProtectMode,
} from "../scripts/admin-env.mjs";

describe("admin-env", () => {
  it("requires VITE_ADMIN_ENABLED=true", () => {
    expect(getAdminEnv({}).enabled).toBe(false);
    expect(getAdminEnv({ VITE_ADMIN_ENABLED: "true" }).enabled).toBe(true);
  });

  it("requires pin header when VITE_ADMIN_PIN is set", () => {
    const env = { VITE_ADMIN_ENABLED: "true", VITE_ADMIN_PIN: "secret" };
    const noPin = checkAdminRequest({ headers: {} }, env);
    expect(noPin.ok).toBe(false);
    expect(noPin.status).toBe(401);

    const ok = checkAdminRequest(
      { headers: { "x-wiki-admin-pin": "secret" } },
      env,
    );
    expect(ok.ok).toBe(true);
  });

  it("allows requests without pin when pin unset", () => {
    const env = { VITE_ADMIN_ENABLED: "true" };
    expect(checkAdminRequest({ headers: {} }, env).ok).toBe(true);
  });

  it("protect mode from VITE_ADMIN_PROTECT or WIKI_ADMIN_PROTECT", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "wiki-admin-"));
    expect(isProtectMode({}, tmp)).toBe(false);
    expect(isProtectMode({ VITE_ADMIN_PROTECT: "true" }, tmp)).toBe(true);
    expect(isProtectMode({ WIKI_ADMIN_PROTECT: "true" }, tmp)).toBe(true);
    expect(
      getAdminEnv({ VITE_ADMIN_PROTECT: "true" }, tmp).protectMode,
    ).toBe(true);
    expect(
      getAdminEnv({ VITE_ADMIN_PROTECT: "true" }, tmp).protectLocked,
    ).toBe(true);
  });

  it("checkDeleteAllowed blocks when protect mode on", () => {
    const blocked = checkDeleteAllowed({ VITE_ADMIN_PROTECT: "true" });
    expect(blocked.ok).toBe(false);
    expect(blocked.status).toBe(403);
    expect(checkDeleteAllowed({}).ok).toBe(true);
  });
});
