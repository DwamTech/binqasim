import { describe, expect, it } from "vitest";

import {
  fatwaInboxDetailSchema,
  fatwaInboxMutationSchema,
  fatwaInboxPageSchema,
  fatwaInboxSummarySchema,
} from "./fatwa-inbox.schemas";

const base = {
  id: 12,
  reference_number: "FTW-2026-000012",
  name: "سائل",
  email: "questioner@example.com",
  question_title: null,
  category_id: null,
  category: null,
  status: "new",
  status_label: "جديدة",
  visibility: null,
  is_listed: null,
  public_url: null,
  created_at: "2026-08-07T10:00:00Z",
  answered_at: null,
};

describe("fatwa inbox runtime schemas", () => {
  it("parses the paginated admin inbox and normalizes nullable listing", () => {
    const page = fatwaInboxPageSchema.parse({
      success: true,
      data: [{ ...base, question_preview: "ما حكم هذه المسألة؟" }],
      meta: { current_page: 1, last_page: 1, per_page: 20, total: 1 },
    });
    expect(page.data[0]).toMatchObject({ id: "12", is_listed: false });
  });

  it("parses detail, summary and mutation envelopes from the workflow API", () => {
    const detail = fatwaInboxDetailSchema.parse({
      data: {
        ...base,
        question: "ما حكم هذه المسألة؟",
        answer: null,
        answered_by: null,
        archived_by: null,
        archived_at: null,
        published_at: null,
        answer_revision: 0,
        updated_at: "2026-08-07T10:00:00Z",
        activity_logs: [],
      },
    });
    expect(detail.reference_number).toBe("FTW-2026-000012");
    expect(
      fatwaInboxSummarySchema.parse({
        data: {
          total: 1,
          new: 1,
          answered: 0,
          archived: 0,
          public: 0,
          private: 0,
        },
      }).new,
    ).toBe(1);
    expect(
      fatwaInboxMutationSchema.parse({
        success: true,
        data: {
          id: 12,
          reference_number: "FTW-2026-000012",
          status: "answered",
          visibility: "public",
          answer: "جواب علمي مكتمل.",
          question_title: "عنوان المسألة",
          category_id: 4,
          category: "علل الحديث",
          is_listed: true,
          public_url: "https://albakry.net/fatwas/answer-12",
          answered_at: "2026-08-07T11:00:00Z",
          archived_at: null,
          published_at: "2026-08-07T11:00:00Z",
          answer_revision: 1,
          updated_at: "2026-08-07T11:00:00Z",
        },
      }).public_url,
    ).toContain("/fatwas/");
  });
});
