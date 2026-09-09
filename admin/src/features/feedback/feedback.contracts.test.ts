import { describe, expect, it } from "vitest";

import {
  feedbackItemSchema,
  feedbackPageSchema,
  feedbackStatuses,
  normalizeFeedbackQuery,
} from "./feedback.contracts";

export const feedbackFixture = {
  id: 1,
  request_number: "FBK-20260729-A1B2",
  type: "complaint" as const,
  status: "new" as const,
  name: "أحمد",
  email: "ahmed@example.test",
  phone: "01000000000",
  category: "الخدمة",
  message: "تفاصيل الشكوى",
  rating: null,
  admin_note: null,
  reviewed_at: null,
  created_at: "2026-07-29T10:00:00Z",
  updated_at: "2026-07-29T10:00:00Z",
  reviewer: null,
};

describe("feedback contracts", () => {
  it("accepts the safe management response and strips sensitive fields", () => {
    const parsed = feedbackItemSchema.parse({
      ...feedbackFixture,
      ip_address: "127.0.0.1",
      user_agent: "secret-agent",
    });
    expect(parsed).toEqual(feedbackFixture);
    expect(JSON.stringify(parsed)).not.toMatch(/ip_address|user_agent/);
  });

  it("validates pagination, types, statuses, and safe query limits", () => {
    expect(
      feedbackPageSchema.parse({
        current_page: 1,
        data: [feedbackFixture],
        last_page: 1,
        per_page: 15,
        total: 1,
      }).total,
    ).toBe(1);
    expect(feedbackStatuses).toHaveLength(5);
    expect(
      normalizeFeedbackQuery({
        type: "suggestion",
        page: "2",
        per_page: "30",
      }),
    ).toMatchObject({ type: "suggestion", page: 2, per_page: 30 });
    expect(() =>
      normalizeFeedbackQuery({ type: "rating", per_page: 500 }),
    ).toThrow();
  });
});
