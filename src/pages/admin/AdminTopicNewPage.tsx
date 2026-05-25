import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  readTopicForm,
  TopicFormFields,
} from "../../components/admin/TopicFormFields";
import { adminFetch } from "../../lib/admin-fetch";

export function AdminTopicNewPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const payload = readTopicForm(new FormData(e.currentTarget));
    try {
      const res = await adminFetch("/api/admin/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "저장 실패");
      }
      navigate(`/admin/topics/${payload.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "저장 실패");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="admin-register-heading">수동 등록</h1>
      <p className="hint">
        Wiki 주소·본문·연관 주제를 직접 입력합니다. 초안이 필요하면 「자연어 등록」
        탭을 사용하세요.
      </p>
      <form className="admin-form" onSubmit={onSubmit}>
        <TopicFormFields />
        {error && <p className="form-error">{error}</p>}
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? "저장 중…" : "등록 · 발행"}
          </button>
          <Link to="/admin/topics">취소</Link>
        </div>
      </form>
    </div>
  );
}
