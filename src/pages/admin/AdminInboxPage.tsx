import { useState } from "react";
import { Link } from "react-router-dom";
import { adminFetch } from "../../lib/admin-fetch";
import { getByKind } from "../../lib/entries";

export function AdminInboxPage() {
  const items = getByKind("inbox");
  const [msg, setMsg] = useState("");

  async function promote(
    inboxSlug: string,
    kind: "topics" | "hubs" | "stories",
    targetSlug: string,
    title: string,
  ) {
    setMsg("");
    const res = await adminFetch("/api/admin/promote-inbox", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inboxSlug,
        kind,
        slug: targetSlug,
        title,
        visibility: kind === "topics" ? "published" : kind === "stories" ? "draft" : "admin",
      }),
    });
    const data = (await res.json()) as { ok?: boolean; error?: string };
    if (data.ok) {
      setMsg(`승격 완료: ${kind}/${targetSlug}. 페이지를 새로고침하세요.`);
      window.location.reload();
    } else {
      setMsg(data.error ?? "승격 실패");
    }
  }

  return (
    <div>
      <h1>Inbox</h1>
      <p className="hint">URL 클리핑 → 주제/허브/스토리로 승격합니다.</p>
      {msg && <p className="form-msg">{msg}</p>}
      <ul className="inbox-admin-list">
        {items.map((item) => (
          <li key={item.slug} className="inbox-admin-item">
            <strong>{item.slug}</strong>
            {item.status && <span className={`status status-${item.status}`}>{item.status}</span>}
            {item.promoted_to && <span> → {item.promoted_to}</span>}
            {item.status !== "promoted" && (
              <div className="promote-form">
                <button
                  type="button"
                  onClick={() => {
                    const title = prompt("제목", item.slug) ?? item.slug;
                    const slug =
                      prompt("Wiki 주소 (영문)", "new-from-inbox") ??
                      "new-from-inbox";
                    if (title && slug) void promote(item.slug, "topics", slug, title);
                  }}
                >
                  주제로 승격
                </button>
              </div>
            )}
            {item.body && <pre className="inbox-preview">{item.body.slice(0, 300)}</pre>}
          </li>
        ))}
      </ul>
      <p>
        <Link to="/admin/topics/register/new">새 주제 직접 등록</Link>
      </p>
    </div>
  );
}
