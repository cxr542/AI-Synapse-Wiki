import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  readTopicForm,
  TopicFormFields,
} from "../../components/admin/TopicFormFields";
import { adminFetch } from "../../lib/admin-fetch";
import { getEntry } from "../../lib/entries";
import { useAdminSettings } from "../../lib/use-admin-settings";

export function AdminTopicEditPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const entry = slug ? getEntry("topics", slug) : undefined;
  const { protectMode } = useAdminSettings();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!slug || !entry) {
    return (
      <p>
        주제 없음. <Link to="/admin/topics">목록</Link>
      </p>
    );
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const payload = readTopicForm(new FormData(e.currentTarget));
    try {
      const res = await adminFetch(`/api/admin/topics/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "저장 실패");
      }
      window.location.href = `/admin/topics/${slug}`;
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setLoading(false);
    }
  }

  async function onDelete() {
    if (protectMode) return;
    if (
      !window.confirm(
        `주제 "${entry.title}" (Wiki 주소: ${slug}) 를 삭제할까요?\n\ndocs/topics/${slug}.md 파일이 제거됩니다.`,
      )
    ) {
      return;
    }
    setError("");
    setDeleting(true);
    try {
      const res = await adminFetch(`/api/admin/topics/${slug}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "삭제 실패");
      }
      navigate("/admin/topics");
    } catch (err) {
      setError(err instanceof Error ? err.message : "삭제 실패");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <h1>주제 편집</h1>
      <p className="hint">
        <code>docs/topics/{slug}.md</code> — 저장 시 build-entries 자동 실행
      </p>
      <form className="admin-form" onSubmit={onSubmit}>
        <TopicFormFields initial={entry} slugReadOnly />
        {error && <p className="form-error">{error}</p>}
        <div className="form-actions">
          <button type="submit" disabled={loading || deleting}>
            {loading ? "저장 중…" : "저장"}
          </button>
          <Link to={`/admin/topics/${slug}`}>보기</Link>
          <Link to="/admin/topics">목록</Link>
        </div>
      </form>
      {!protectMode ? (
        <div className="admin-danger-zone">
          <h2>삭제</h2>
          <button
            type="button"
            className="btn-danger"
            disabled={loading || deleting}
            onClick={() => void onDelete()}
          >
            {deleting ? "삭제 중…" : "주제 삭제"}
          </button>
        </div>
      ) : (
        <p className="hint">보호 모드 — 삭제 메뉴가 비활성화되어 있습니다.</p>
      )}
    </div>
  );
}
