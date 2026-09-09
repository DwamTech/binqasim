import { describe, expect, it, vi } from "vitest";

import { PageContainer } from "../../../shared/components/layout/page-container";
import { ErrorState, PageSkeleton } from "../../../shared/components/ui";

import DashboardError from "./error";
import DashboardLoading from "./loading";

describe("dashboard route boundaries", () => {
  it("keeps the protected shell visible behind a route-level skeleton", () => {
    const boundary = DashboardLoading();
    expect(boundary.type).toBe(PageContainer);
    expect(boundary.props.children.type).toBe(PageSkeleton);
  });

  it("offers a stable retry action for route rendering errors", () => {
    const reset = vi.fn();
    const boundary = DashboardError({
      error: new Error("private runtime detail"),
      reset,
    });
    expect(boundary.type).toBe(PageContainer);
    expect(boundary.props.children.type).toBe(ErrorState);
    expect(boundary.props.children.props.onRetry).toBe(reset);
    expect(JSON.stringify(boundary.props)).not.toContain(
      "private runtime detail",
    );
  });
});
