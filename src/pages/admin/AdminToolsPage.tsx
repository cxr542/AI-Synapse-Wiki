import { useState } from "react";
import { adminFetch } from "../../lib/admin-fetch";
import { generatedAt } from "../../lib/entries";

export function AdminToolsPage() {
  const [msg, setMsg] = useState("");

  async function rebuild() {
    setMsg("빌드 중…");
    const res = await adminFetch("/api/admin/rebuild", { method: "POST" });
    const data = (await res.json()) as { ok?: boolean; count?: number; error?: string };
    if (data.ok) {
      setMsg(`entries.json 갱신 (${data.count}건). 브라우저를 새로고침하세요.`);
      window.location.reload();
    } else {
      setMsg(data.error ?? "실패");
    }
  }

  return (
    <div>
      <h1>도구</h1>
      <p className="hint">마지막 빌드: {generatedAt}</p>
      <ul className="link-list">
        <li>
          <button type="button" onClick={() => void rebuild()}>
            build-entries 실행
          </button>
        </li>
        <li>
          <code>npm run build:export</code> — 터미널에서 NotebookLM 묶음 생성
        </li>
        <li>
          <code>npm run notify</code> — Hermes Gmail 알림
        </li>
      </ul>
      {msg && <p className="form-msg">{msg}</p>}
    </div>
  );
}
