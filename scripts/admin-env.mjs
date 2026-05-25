/**
 * Admin lock env (Vite dev server + shared checks)
 */
import { readAdminSettings, writeProtectMode } from "./admin-settings-store.mjs";
import { wikiRoot } from "./admin-api-handlers.mjs";

/** @param {Record<string, string>} env */
function isProtectEnv(env) {
  return (
    env.VITE_ADMIN_PROTECT === "true" || env.WIKI_ADMIN_PROTECT === "true"
  );
}

/** @param {Record<string, string>} [env] */
export function isProtectModeLockedByEnv(env = process.env) {
  return isProtectEnv(env);
}

/** @param {string} [root] */
export function getProtectModeFromFile(root = wikiRoot()) {
  return Boolean(readAdminSettings(root).protectMode);
}

/**
 * @param {Record<string, string>} [env]
 * @param {string} [root]
 */
export function resolveProtectMode(env = process.env, root = wikiRoot()) {
  const protectLocked = isProtectEnv(env);
  const protectFromFile = getProtectModeFromFile(root);
  const protectMode = protectLocked || protectFromFile;
  return { protectMode, protectLocked, protectFromFile };
}

/**
 * @param {Record<string, string>} [env]
 * @param {string} [root]
 */
export function isProtectMode(env = process.env, root = wikiRoot()) {
  return resolveProtectMode(env, root).protectMode;
}

/**
 * @param {boolean} enabled
 * @param {Record<string, string>} [env]
 * @param {string} [root]
 */
export function setProtectModeSetting(enabled, env = process.env, root = wikiRoot()) {
  if (isProtectEnv(env)) {
    throw new Error(
      "VITE_ADMIN_PROTECT 로 보호 모드가 고정되어 있습니다. .env 를 변경한 뒤 dev 서버를 재시작하세요.",
    );
  }
  writeProtectMode(enabled, root);
  return resolveProtectMode(env, root);
}

/**
 * @param {Record<string, string>} [env]
 * @returns {{ ok: true } | { ok: false; status: number; error: string }}
 */
export function checkDeleteAllowed(env = process.env) {
  if (isProtectMode(env)) {
    return {
      ok: false,
      status: 403,
      error: isProtectEnv(env)
        ? "보호 모드가 .env 에서 켜져 있습니다. VITE_ADMIN_PROTECT 를 끄고 dev 서버를 재시작하세요."
        : "보호 모드가 켜져 있습니다. 주제 목록(/admin/topics) 관리 열에서 보호 모드를 끄세요.",
    };
  }
  return { ok: true };
}

/** @param {Record<string, string>} [env] */
export function getAdminEnv(env = process.env, root = wikiRoot()) {
  const enabled = env.VITE_ADMIN_ENABLED === "true";
  const pin = (env.VITE_ADMIN_PIN || "").trim();
  const { protectMode, protectLocked } = resolveProtectMode(env, root);
  return { enabled, pin, pinRequired: pin.length > 0, protectMode, protectLocked };
}

/**
 * @param {import('http').IncomingMessage} req
 * @param {Record<string, string>} [env]
 */
export function checkAdminRequest(req, env = process.env) {
  const { enabled, pin, pinRequired } = getAdminEnv(env);
  if (!enabled) {
    return {
      ok: false,
      status: 403,
      error:
        "관리 API가 비활성화되어 있습니다. .env 에 VITE_ADMIN_ENABLED=true 를 설정하세요.",
    };
  }
  if (pinRequired) {
    const got = req.headers["x-wiki-admin-pin"];
    if (typeof got !== "string" || got !== pin) {
      return {
        ok: false,
        status: 401,
        error: "PIN이 필요하거나 올바르지 않습니다.",
      };
    }
  }
  return { ok: true };
}
