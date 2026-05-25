import { Link } from "react-router-dom";

export function AdminDisabledPage() {
  return (
    <div className="admin-gate">
      <h1>관리 비활성화</h1>
      <p className="hint">
        로컬에서 관리 화면을 쓰려면 프로젝트 루트 <code>.env</code> 에 다음을
        설정하고 dev 서버를 다시 시작하세요.
      </p>
      <pre className="env-sample">
        {`VITE_ADMIN_ENABLED=true
VITE_ADMIN_PIN=1234   # 선택: PIN 없으면 잠금 없음`}
      </pre>
      <p>
        <Link to="/">사용자 Wiki로</Link>
      </p>
    </div>
  );
}
