/** 로컬 관리 잠금 — Vite env (빌드 시 주입) */
export function getAdminConfig() {
  const enabled = import.meta.env.VITE_ADMIN_ENABLED === "true";
  const pin = (import.meta.env.VITE_ADMIN_PIN ?? "").trim();
  const protectLocked = import.meta.env.VITE_ADMIN_PROTECT === "true";
  return {
    enabled,
    pinRequired: pin.length > 0,
    protectMode: protectLocked,
    protectLocked,
  };
}

export function verifyAdminPin(pin: string): boolean {
  const expected = (import.meta.env.VITE_ADMIN_PIN ?? "").trim();
  if (!expected) return true;
  return pin.trim() === expected;
}
