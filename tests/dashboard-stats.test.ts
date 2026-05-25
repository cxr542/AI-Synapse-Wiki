import { describe, expect, it } from "vitest";
import {
  computeDashboardStats,
  formatDashboardMonth,
  maxMonthCount,
} from "../src/lib/dashboard-stats";

describe("dashboard-stats", () => {
  it("formats month labels", () => {
    expect(formatDashboardMonth("2026-05")).toBe("2026.05");
  });

  it("computes stats from bundled entries", () => {
    const s = computeDashboardStats();
    expect(s.topics.total).toBeGreaterThanOrEqual(2);
    expect(s.visibilityTopics).toHaveLength(3);
    expect(s.publishedPct).toBeGreaterThanOrEqual(0);
    expect(s.registrationsByMonth).toHaveLength(6);
    expect(s.updatesByMonth).toHaveLength(6);
    expect(maxMonthCount(s.registrationsByMonth)).toBeGreaterThanOrEqual(1);
  });
});
