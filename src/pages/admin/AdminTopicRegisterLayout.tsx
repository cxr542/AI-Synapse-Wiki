import { Link, NavLink, Outlet } from "react-router-dom";

export function AdminTopicRegisterLayout() {
  return (
    <div className="admin-topic-register">
      <p className="breadcrumb">
        <Link to="/admin/topics">주제 목록</Link>
        <span> / </span>
        <span>주제 등록</span>
      </p>
      <nav className="admin-register-tabs" aria-label="주제 등록 방식">
        <NavLink
          to="/admin/topics/register/nl"
          className={({ isActive }) => (isActive ? "active" : undefined)}
        >
          자연어 등록
        </NavLink>
        <NavLink
          to="/admin/topics/register/new"
          className={({ isActive }) => (isActive ? "active" : undefined)}
        >
          수동 등록
        </NavLink>
      </nav>
      <Outlet />
    </div>
  );
}
