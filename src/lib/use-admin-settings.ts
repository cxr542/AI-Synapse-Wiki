import { useCallback, useEffect, useState } from "react";
import { getAdminConfig } from "./admin-config";
import { adminFetch } from "./admin-fetch";

export type AdminSettings = {
  llmConfigured: boolean;
  protectMode: boolean;
  protectLocked?: boolean;
  protectFromFile?: boolean;
  llmModel?: string;
};

/** 클라이언트 .env + dev API 설정 (보호 모드·LLM) */
export function useAdminSettings() {
  const local = getAdminConfig();
  const [remote, setRemote] = useState<AdminSettings | null>(null);
  const [protectSaving, setProtectSaving] = useState(false);

  const reload = useCallback(async () => {
    try {
      const res = await adminFetch("/api/admin/config");
      const data = (await res.json()) as AdminSettings & { ok?: boolean };
      if (!res.ok || data.ok === false) {
        setRemote(null);
        return;
      }
      setRemote({
        llmConfigured: Boolean(data.llmConfigured),
        protectMode: Boolean(data.protectMode),
        protectLocked: Boolean(data.protectLocked),
        protectFromFile: Boolean(data.protectFromFile),
        llmModel: data.llmModel,
      });
    } catch {
      setRemote(null);
    }
  }, []);

  useEffect(() => {
    void reload();
    const onChange = () => {
      void reload();
    };
    window.addEventListener("wiki-admin-settings", onChange);
    return () => window.removeEventListener("wiki-admin-settings", onChange);
  }, [reload]);

  const protectMode = remote?.protectMode ?? local.protectMode;
  const protectLocked = remote?.protectLocked ?? local.protectLocked;

  async function setProtectMode(on: boolean) {
    if (protectLocked) return;
    setProtectSaving(true);
    try {
      const res = await adminFetch("/api/admin/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ protectMode: on }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        protectMode?: boolean;
      };
      if (!res.ok || data.ok === false) {
        throw new Error(data.error ?? "보호 모드 설정 실패");
      }
      await reload();
      window.dispatchEvent(new Event("wiki-admin-settings"));
    } finally {
      setProtectSaving(false);
    }
  }

  return {
    llmConfigured: remote?.llmConfigured ?? false,
    protectMode,
    protectLocked,
    protectSaving,
    setProtectMode,
    reload,
    llmModel: remote?.llmModel,
    loaded: remote !== null,
  };
}
