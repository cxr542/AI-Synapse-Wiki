import { useMemo, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { DashboardPanel } from "../../components/admin/DashboardPanel";
import {
  computeDashboardStats,
  DASHBOARD_RECENT_ROWS,
  formatDashboardMonth,
  maxMonthCount,
  type MonthCount,
} from "../../lib/dashboard-stats";
import { compareEntryTitle } from "../../lib/entries";
import type { WikiEntry } from "../../lib/types";
import { useAdminSettings } from "../../lib/use-admin-settings";

const EMPTY_BAR_PCT = 10;

function KpiCard({
  label,
  value,
  to,
  hint,
}: {
  label: string;
  value: number | string;
  to: string;
  hint?: string;
}) {
  return (
    <Link to={to} className="obs-kpi obs-kpi-link" role="listitem">
      <span className="obs-kpi-label">{label}</span>
      <strong>{value}</strong>
      {hint !== undefined && <span className="obs-kpi-hint">{hint}</span>}
    </Link>
  );
}

function StatTile({
  label,
  value,
  hint,
  to,
  accent,
}: {
  label: string;
  value: number | string;
  hint?: string;
  to?: string;
  accent?: "orange" | "green" | "blue" | "yellow" | "muted";
}) {
  const inner = (
    <>
      <span className="obs-stat-label">{label}</span>
      <span className={`obs-stat-value obs-stat-${accent ?? "orange"}`}>
        {value}
      </span>
      {hint !== undefined && <span className="obs-stat-hint">{hint}</span>}
    </>
  );
  return (
    <div className={`obs-stat-tile obs-stat-${accent ?? "orange"}`}>
      {to ? (
        <Link to={to} className="obs-stat-link">
          {inner}
        </Link>
      ) : (
        inner
      )}
    </div>
  );
}

function MonthBarChart({
  series,
  max,
  colorClass,
  ariaLabel,
}: {
  series: MonthCount[];
  max: number;
  colorClass: string;
  ariaLabel: string;
}) {
  const ticks = [0, Math.ceil(max / 2), max];
  return (
    <div className="obs-chart-wrap">
      <div className="obs-chart-yaxis" aria-hidden>
        {ticks
          .slice()
          .reverse()
          .map((t) => (
            <span key={t}>{t}</span>
          ))}
      </div>
      <div className="obs-chart-main">
        <div className="obs-chart-grid" aria-hidden />
        <div className="obs-bars" role="img" aria-label={ariaLabel}>
          {series.map((m) => {
            const pct =
              m.count === 0
                ? EMPTY_BAR_PCT
                : Math.max(EMPTY_BAR_PCT, (m.count / max) * 100);
            const empty = m.count === 0;
            return (
              <div key={m.month} className="obs-bar-col">
                <div className="obs-bar-stack">
                  <div
                    className={`obs-bar-fill ${colorClass}${empty ? " obs-bar-empty" : ""}`}
                    style={{ height: `${pct}%` }}
                    title={`${formatDashboardMonth(m.month)}: ${m.count}`}
                  />
                </div>
                <span className="obs-bar-count">{m.count}</span>
                <span className="obs-bar-label">
                  {formatDashboardMonth(m.month)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function VisibilityChart({
  items,
  total,
}: {
  items: { label: string; count: number; key: string }[];
  total: number;
}) {
  const displayTotal = total > 0 ? total : 1;
  return (
    <div className="obs-vis-block">
      <div
        className="obs-vis-track"
        role="img"
        aria-label="주제 visibility 분포"
      >
        {items.map((v) => (
          <div
            key={v.key}
            className={`obs-vis-seg obs-vis-${v.key}${v.count === 0 ? " obs-vis-zero" : ""}`}
            style={{
              width: `${Math.max(v.count === 0 && total === 0 ? 100 / items.length : (v.count / displayTotal) * 100, v.count > 0 ? 4 : 0)}%`,
            }}
            title={`${v.label}: ${v.count}`}
          />
        ))}
      </div>
      <ul className="obs-vis-legend">
        {items.map((v) => (
          <li key={v.key}>
            <span className={`obs-vis-dot obs-vis-${v.key}`} />
            <span>{v.label}</span>
            <strong>{v.count}</strong>
            <span className="obs-vis-pct">
              {total > 0 ? Math.round((v.count / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PublishGauge({ pct, total }: { pct: number; total: number }) {
  return (
    <div className="obs-gauge">
      <div
        className="obs-gauge-ring"
        style={{ "--pct": `${pct}` } as CSSProperties}
        role="img"
        aria-label={`발행률 ${pct}%`}
      >
        <span className="obs-gauge-value">{pct}%</span>
      </div>
      <p className="obs-gauge-caption">
        published / {total} 주제
        <br />
        <span className="obs-gauge-sub">
          {total === 0 ? "주제 등록 후 갱신됩니다" : "사용자 Wiki 노출 비율"}
        </span>
      </p>
    </div>
  );
}

function RecentTopicsTable({
  rows,
  placeholderCount,
}: {
  rows: WikiEntry[];
  placeholderCount: number;
}) {
  const placeholders = Array.from({ length: placeholderCount }, (_, i) => i);
  return (
    <div className="obs-table-scroll">
      <table className="obs-table">
        <thead>
          <tr>
            <th>제목</th>
            <th>visibility</th>
            <th>등록</th>
            <th>갱신</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((e) => (
            <tr key={e.slug}>
              <td>
                <Link to={`/admin/topics/${e.slug}`}>{e.title}</Link>
              </td>
              <td>
                <span
                  className={`obs-pill obs-pill-${e.visibility ?? "published"}`}
                >
                  {e.visibility ?? "published"}
                </span>
              </td>
              <td className="obs-td-mono">{e.collected_at ?? "—"}</td>
              <td className="obs-td-mono">{e.updated_at ?? "—"}</td>
            </tr>
          ))}
          {placeholders.map((i) => (
            <tr key={`ph-${i}`} className="obs-table-ph">
              <td colSpan={4}>
                <span className="obs-table-ph-bar" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TopicIndexChips({ topics }: { topics: WikiEntry[] }) {
  const sorted = [...topics].sort(compareEntryTitle);
  const slots = 12;
  const placeholders = Math.max(0, slots - sorted.length);
  return (
    <div className="obs-chip-grid">
      {sorted.map((e) => (
        <Link
          key={e.slug}
          to={`/admin/topics/${e.slug}`}
          className="obs-chip"
        >
          <span className="obs-chip-title">{e.title}</span>
          <code className="obs-chip-slug">{e.slug}</code>
        </Link>
      ))}
      {Array.from({ length: placeholders }, (_, i) => (
        <div key={`chip-ph-${i}`} className="obs-chip obs-chip-ph" aria-hidden>
          <span className="obs-chip-ph-line" />
          <span className="obs-chip-ph-line short" />
        </div>
      ))}
    </div>
  );
}

export function AdminDashboard() {
  const stats = useMemo(() => computeDashboardStats(), []);
  const { protectMode } = useAdminSettings();
  const regMax = maxMonthCount(stats.registrationsByMonth);
  const updMax = maxMonthCount(stats.updatesByMonth);
  const recentPlaceholders = Math.max(
    0,
    DASHBOARD_RECENT_ROWS - stats.recentTopics.length,
  );

  return (
    <div className="admin-obs">
      <header className="obs-header">
        <div>
          <h1 className="obs-title">Wiki 관측 대시보드</h1>
          <p className="obs-meta">
            스냅샷 · <time dateTime={stats.generatedAt}>{stats.generatedAt}</time>
            {protectMode && (
              <span className="obs-badge obs-badge-warn">보호 모드 ON</span>
            )}
          </p>
        </div>
        <div className="obs-header-actions">
          <Link to="/admin/topics/register" className="obs-btn">
            주제 등록
          </Link>
          <Link to="/admin/settings/tools" className="obs-btn obs-btn-ghost">
            build-entries
          </Link>
        </div>
      </header>

      <div className="obs-kpi-strip" role="list">
        <KpiCard
          label="주제"
          value={stats.topics.total}
          to="/admin/topics"
          hint="전체 목록"
        />
        <KpiCard
          label="발행률"
          value={`${stats.publishedPct}%`}
          to="/admin/topics?visibility=published"
          hint={`published ${stats.topics.published}`}
        />
        <KpiCard
          label="Inbox"
          value={stats.inboxPending}
          to="/admin/settings/inbox"
          hint={stats.inboxPending > 0 ? "미승격 검토" : "대기 0건"}
        />
        <KpiCard
          label="hubs"
          value={stats.hubs}
          to="/admin/settings/hubs"
          hint="AI 소스 기지"
        />
        <KpiCard
          label="stories"
          value={stats.stories}
          to="/admin/settings/stories"
          hint={`draft ${stats.storiesDraft}`}
        />
        <KpiCard
          label="draft 주제"
          value={stats.topics.draft}
          to="/admin/topics?visibility=draft"
          hint="미발행 주제"
        />
      </div>

      <div className="obs-grid">
        <DashboardPanel title="주제 (topics)" span={3} className="obs-panel-stat">
          <StatTile
            label="전체"
            value={stats.topics.total}
            hint={`published ${stats.topics.published}`}
            to="/admin/topics"
            accent="orange"
          />
        </DashboardPanel>
        <DashboardPanel title="발행 · draft" span={3} className="obs-panel-stat">
          <div className="obs-stat-row">
            <StatTile
              label="published"
              value={stats.topics.published}
              accent="green"
            />
            <StatTile label="draft" value={stats.topics.draft} accent="yellow" />
          </div>
        </DashboardPanel>
        <DashboardPanel title="Inbox 대기" span={3} className="obs-panel-stat">
          <StatTile
            label="미승격"
            value={stats.inboxPending}
            hint={stats.inboxPending > 0 ? "검토 필요" : "대기 0건"}
            to="/admin/settings/inbox"
            accent={stats.inboxPending > 0 ? "yellow" : "muted"}
          />
        </DashboardPanel>
        <DashboardPanel title="허브 · 스토리" span={3} className="obs-panel-stat">
          <div className="obs-stat-row">
            <StatTile
              label="hubs"
              value={stats.hubs}
              to="/admin/settings/hubs"
              accent="blue"
            />
            <StatTile
              label="stories"
              value={stats.stories}
              hint={`draft ${stats.storiesDraft}`}
              to="/admin/settings/stories"
              accent="blue"
            />
          </div>
        </DashboardPanel>

        <DashboardPanel
          title="주제 등록 (월별)"
          span={6}
          subtitle="collected_at · 최근 6개월"
          className="obs-panel-chart"
        >
          <MonthBarChart
            series={stats.registrationsByMonth}
            max={regMax}
            colorClass="obs-bar-reg"
            ariaLabel="월별 주제 등록 수"
          />
        </DashboardPanel>

        <DashboardPanel
          title="주제 갱신 (월별)"
          span={6}
          subtitle="파일 수정일 · 최근 6개월"
          className="obs-panel-chart"
        >
          <MonthBarChart
            series={stats.updatesByMonth}
            max={updMax}
            colorClass="obs-bar-upd"
            ariaLabel="월별 주제 갱신 수"
          />
        </DashboardPanel>

        <DashboardPanel title="발행 비율" span={3} className="obs-panel-gauge">
          <PublishGauge pct={stats.publishedPct} total={stats.topics.total} />
        </DashboardPanel>

        <DashboardPanel title="주제 visibility" span={5} className="obs-panel-vis">
          <VisibilityChart
            items={stats.visibilityTopics}
            total={stats.topics.total}
          />
        </DashboardPanel>

        <DashboardPanel
          title="파이프라인"
          span={4}
          subtitle="수집 · 정리"
          className="obs-panel-pipeline"
        >
          <ul className="obs-pipeline">
            <li>
              <span className="obs-pipeline-step">Inbox</span>
              <strong>{stats.inboxPending}</strong>
              <Link to="/admin/settings/inbox">열기</Link>
            </li>
            <li>
              <span className="obs-pipeline-step">hubs</span>
              <strong>{stats.hubs}</strong>
              <Link to="/admin/settings/hubs">열기</Link>
            </li>
            <li>
              <span className="obs-pipeline-step">stories</span>
              <strong>{stats.stories}</strong>
              <Link to="/admin/settings/stories">열기</Link>
            </li>
            <li>
              <span className="obs-pipeline-step">topics</span>
              <strong>{stats.topics.total}</strong>
              <Link to="/admin/topics">열기</Link>
            </li>
          </ul>
        </DashboardPanel>

        <DashboardPanel
          title="최근 갱신 주제"
          span={8}
          subtitle={`updated_at · 상위 ${DASHBOARD_RECENT_ROWS}건`}
          className="obs-panel-table"
        >
          <RecentTopicsTable
            rows={stats.recentTopics}
            placeholderCount={recentPlaceholders}
          />
        </DashboardPanel>

        <DashboardPanel
          title="주제 인덱스"
          span={12}
          subtitle={
            stats.allTopics.length > 0
              ? `${stats.allTopics.length}건 · 제목순`
              : "등록된 주제가 표시됩니다"
          }
          className="obs-panel-chips"
        >
          <TopicIndexChips topics={stats.allTopics} />
        </DashboardPanel>

        <DashboardPanel title="바로가기" span={12} className="obs-panel-shortcuts">
          <nav className="obs-shortcut-grid">
            <Link to="/admin/topics" className="obs-shortcut-card">
              <strong>주제 목록</strong>
              <span>{stats.topics.total}건</span>
            </Link>
            <Link to="/admin/topics/register/nl" className="obs-shortcut-card">
              <strong>자연어 등록</strong>
              <span>초안 생성</span>
            </Link>
            <Link to="/admin/topics/register/new" className="obs-shortcut-card">
              <strong>수동 등록</strong>
              <span>폼 입력</span>
            </Link>
            <Link to="/admin/settings/inbox" className="obs-shortcut-card">
              <strong>Inbox</strong>
              <span>{stats.inboxPending} 대기</span>
            </Link>
            <Link to="/admin/settings/tools" className="obs-shortcut-card">
              <strong>도구</strong>
              <span>build-entries</span>
            </Link>
            <Link to="/" className="obs-shortcut-card">
              <strong>Wiki Home</strong>
              <span>사용자 화면</span>
            </Link>
          </nav>
        </DashboardPanel>
      </div>
    </div>
  );
}
