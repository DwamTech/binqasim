import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

function source(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

const list = source(
  "src/features/feedback/components/feedback-management-view.tsx",
);
const detail = source(
  "src/features/feedback/components/feedback-detail-view.tsx",
);

describe("feedback management vertical slice", () => {
  it("implements tabs, filters, semantic table, status workflow, and detail", () => {
    expect(list).toContain('"complaint", "suggestion"');
    expect(list).toContain("feedbackStatuses");
    expect(list).toContain('aria-label="البحث في الطلبات"');
    expect(list).toContain('<th scope="col">');
    expect(list).toContain("updateFeedbackStatus");
    expect(list).toContain("عرض التفاصيل");
    expect(detail).toContain("ملاحظة الإدارة");
    expect(detail).toContain("السجل الإداري");
  });

  it("keeps pages admin-only and mutations same-origin", () => {
    for (const path of [
      "src/app/(protected)/dashboard/feedback/page.tsx",
      "src/app/(protected)/dashboard/feedback/[id]/page.tsx",
    ])
      expect(source(path)).toContain("requireDashboardAdmin()");
    expect(source("src/app/api/feedback/[id]/status/route.ts")).toContain(
      "isSameOriginMutation",
    );
  });

  it("does not expose backend auth or private request metadata", () => {
    for (const content of [list, detail]) {
      expect(content).not.toMatch(
        /authorization|bearer|cms_session|ip_address|user_agent/i,
      );
      expect(content).not.toContain("/admin/feedback-submissions");
    }
  });
});
