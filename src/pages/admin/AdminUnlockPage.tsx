import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { unlockAdminSession } from "../../lib/admin-session";

export function AdminUnlockPage() {
  const [error, setError] = useState("");

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const pin = new FormData(e.currentTarget).get("pin");
    if (typeof pin !== "string" || !unlockAdminSession(pin)) {
      setError("PIN이 올바르지 않습니다.");
      return;
    }
    window.location.reload();
  }

  return (
    <div className="admin-gate">
      <h1>관리 잠금</h1>
      <p className="hint">로컬 Wiki 관리자 PIN을 입력하세요.</p>
      <form className="admin-form admin-gate-form" onSubmit={onSubmit}>
        <label>
          PIN
          <input
            name="pin"
            type="password"
            autoComplete="current-password"
            required
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button type="submit">잠금 해제</button>
      </form>
      <p>
        <Link to="/">사용자 Wiki로</Link>
      </p>
    </div>
  );
}
