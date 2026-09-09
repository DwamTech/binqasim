import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

import type { LibraryIndexSubmission } from "../domain/library-indexes.contracts";
import { LibraryIndexSubmissionDetailView } from "./library-index-submission-detail-view";
import { LibraryIndexSubmissionsListView } from "./library-index-submissions-list-view";

const item: LibraryIndexSubmission = {
  id: 12,
  type: "golden_visit",
  name: "عبدالله الزائر",
  title: null,
  visit_date: "2026-08-09",
  status: "pending",
  image_url: "https://back.example.test/storage/photo.webp",
  reviewed_at: null,
  reviewer: null,
  rejection_reason: null,
  created_at: "2026-08-09T10:00:00Z",
};

describe("library index dashboard views", () => {
  it("renders unified type tabs, filters, semantic table and review actions", () => {
    const markup = renderToStaticMarkup(
      <LibraryIndexSubmissionsListView
        paginator={{
          current_page: 1,
          data: [item],
          last_page: 1,
          per_page: 20,
          total: 1,
          filter_options: {
            types: [
              { value: "golden_visit", label: "السجل الذهبي" },
              { value: "guest", label: "سجل الضيوف" },
            ],
            statuses: ["pending", "approved", "rejected"],
          },
          stats: {
            total: 1,
            pending: 1,
            approved: 0,
            rejected: 0,
            by_type: {
              golden_visit: {
                total: 1,
                pending: 1,
                approved: 0,
                rejected: 0,
              },
              guest: { total: 0, pending: 0, approved: 0, rejected: 0 },
            },
          },
        }}
        query={{ page: 1, per_page: 20 }}
      />,
    );
    expect(markup).toContain("سجل الزوار الذهبيين");
    expect(markup).toContain("سجل الضيوف");
    expect(markup).toContain('name="status"');
    expect(markup).toContain('<th scope="col">مقدم الطلب</th>');
    expect(markup).toContain("فتح التفاصيل");
    expect(markup).toContain("قبول");
    expect(markup).toContain("رفض");
    expect(markup).toContain("/dashboard/library-indexes/golden_visit/12");
  });

  it("renders type-specific details and keeps rejected reason internal", () => {
    const markup = renderToStaticMarkup(
      <LibraryIndexSubmissionDetailView
        initialItem={{
          ...item,
          status: "rejected",
          reviewed_at: "2026-08-09T12:00:00Z",
          reviewer: { id: 1, name: "المراجع" },
          rejection_reason: "الصورة غير واضحة",
        }}
      />,
    );
    expect(markup).toContain("بيانات السجل");
    expect(markup).toContain("سجل المراجعة");
    expect(markup).toContain("الصورة غير واضحة");
    expect(markup).toContain("المراجع");
    expect(markup).not.toContain("تأكيد القبول");
  });
});
