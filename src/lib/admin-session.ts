import { getAdminConfig, verifyAdminPin } from "./admin-config";

const UNLOCK_KEY = "wiki-admin-unlock";
const PIN_KEY = "wiki-admin-pin";

export function isAdminSessionUnlocked(): boolean {
  const { enabled, pinRequired } = getAdminConfig();
  if (!enabled) return false;
  if (!pinRequired) return true;
  return sessionStorage.getItem(UNLOCK_KEY) === "1";
}

export function unlockAdminSession(pin: string): boolean {
  if (!verifyAdminPin(pin)) return false;
  sessionStorage.setItem(UNLOCK_KEY, "1");
  const stored = (import.meta.env.VITE_ADMIN_PIN ?? "").trim();
  if (stored) sessionStorage.setItem(PIN_KEY, stored);
  return true;
}

export function lockAdminSession(): void {
  sessionStorage.removeItem(UNLOCK_KEY);
  sessionStorage.removeItem(PIN_KEY);
}

export function getAdminPinHeader(): string | null {
  return sessionStorage.getItem(PIN_KEY);
}
