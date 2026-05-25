import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminFetch } from "../../lib/admin-fetch";
import { getByKind } from "../../lib/entries";
import { WIKI_SLUG_LABEL } from "../../lib/labels";
import { useAdminSettings } from "../../lib/use-admin-settings";

type Draft = {
  title: string;
  slug: string;
  body: string;
  source_url?: string | null;
  tags?: string[];
  related?: Array<{ kind: string; slug: string }>;
  mode?: string;
  note?: string;
};

export function AdminTopicNlPage() {
  const navigate = useNavigate();
  const existing = getByKind("topics");
  const [request, setRequest] = useState("헤르메스 에이전트 등록해줘");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { llmConfigured, protectMode, loaded } = useAdminSettings();

  const draftLooksLikePlaceholder =
    draft != null &&
    (draft.slug === "new-topic" ||
      draft.body.includes("채워 주세요") ||
      (draft.body.includes("(항목)") && draft.body.includes("(설명)")));

  async function makeDraft(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    setDraft(null);
    try {
      const res = await adminFetch("/api/admin/topics/nl-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        draft?: Draft;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.draft) {
        throw new Error(data.error ?? "초안 생성 실패");
      }
      setDraft(data.draft);
    } catch (err) {
      setError(err instanceof Error ? err.message : "초안 생성 실패");
    } finally {
      setLoading(false);
    }
  }

  async function publish() {
    if (!draft) return;
    setError("");
    setSaving(true);
    try {
      const res = await adminFetch("/api/admin/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draft.title,
          slug: draft.slug,
          body: draft.body,
          source_url: draft.source_url ?? null,
          tags: draft.tags ?? ["topic"],
          related: draft.related ?? [],
          visibility: "published",
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "저장 실패");
      }
      navigate(`/admin/topics/${draft.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="admin-register-heading">자연어 등록</h1>
      <p className="hint">
        예: 「제미나이 등록해줘」— Wiki 포맷 초안을 만든 뒤 확인하고 발행합니다.
      </p>
      {loaded && !llmConfigured && (
        <p className="form-error">
          <code>WIKI_TOPIC_LLM_API_KEY</code> 가 .env에 없습니다. 지금은{" "}
          <strong>규칙·빈 템플릿</strong>만 쓰입니다 (제미나이·헤르메스·클로드 코드 등
          일부만 본문 자동). Cursor 채팅 등록과 결과가 다릅니다. dev 서버 재시작 필요.
        </p>
      )}
      {loaded && llmConfigured && (
        <p className="form-msg">Gemini API 연결됨 — 초안 mode: llm</p>
      )}
      {protectMode && (
        <p className="hint">보호 모드 켜짐 — 삭제는 목록·편집 화면에서 숨김.</p>
      )}

      <form className="admin-form" onSubmit={makeDraft}>
        <label>
          요청 문장
          <textarea
            name="request"
            rows={3}
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            placeholder="헤르메스 에이전트 등록해줘"
            required
          />
        </label>
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? "초안 생성 중…" : "Wiki 초안 만들기"}
          </button>
        </div>
      </form>

      {draft && (
        <section className="nl-preview">
          <p className="form-msg">
            모드: <strong>{draft.mode}</strong>
            {draft.note ? ` — ${draft.note}` : ""}
          </p>
          {draftLooksLikePlaceholder && (
            <p className="form-error">
              템플릿 골격만 있습니다. Wiki 주소·본문을 채우거나 규칙/LLM 초안을 다시
              만드세요.
            </p>
          )}
          <label>
            제목
            <input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
          </label>
          <label>
            {WIKI_SLUG_LABEL}
            <input
              value={draft.slug}
              onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
              aria-label={WIKI_SLUG_LABEL}
            />
          </label>
          <label>
            출처 URL
            <input
              value={draft.source_url ?? ""}
              onChange={(e) =>
                setDraft({ ...draft, source_url: e.target.value || null })
              }
            />
          </label>
          <label>
            본문 (마크다운)
            <textarea
              rows={16}
              value={draft.body}
              onChange={(e) => setDraft({ ...draft, body: e.target.value })}
            />
          </label>
          <p className="hint">
            사용자 Wiki:{" "}
            <Link to={`/topics/${draft.slug}`} target="_blank" rel="noreferrer">
              /topics/{draft.slug}
            </Link>
          </p>
          <div className="form-actions">
            <button
              type="button"
              disabled={saving || draftLooksLikePlaceholder}
              onClick={() => void publish()}
            >
              {saving ? "저장 중…" : "확인 후 등록 · 발행"}
            </button>
          </div>
        </section>
      )}

      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
