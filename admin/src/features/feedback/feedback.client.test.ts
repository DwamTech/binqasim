import { afterEach, describe, expect, it, vi } from "vitest";

import {
  feedbackErrorMessage,
  listFeedback,
  updateFeedbackStatus,
} from "./feedback.client";
import { feedbackFixture } from "./feedback.contracts.test";

afterEach(() => vi.unstubAllGlobals());

const ok = (data: unknown) => Response.json({ success: true, data });

describe("feedback browser client", () => {
  it("uses same-origin BFF URLs without authorization headers", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      ok({
        current_page: 1,
        data: [],
        last_page: 1,
        per_page: 15,
        total: 0,
      }),
    );
    vi.stubGlobal("fetch", fetcher);
    await listFeedback({
      type: "suggestion",
      status: "new",
      search: "أحمد",
      page: 2,
      per_page: 30,
    });
    expect(fetcher.mock.calls[0]?.[0]).toContain(
      "/api/feedback?type=suggestion",
    );
    expect(fetcher.mock.calls[0]?.[0]).toContain("status=new");
    expect(JSON.stringify(fetcher.mock.calls[0]?.[1])).not.toMatch(
      /authorization|bearer|token/i,
    );
  });

  it("sends explicit non-optimistic status updates", async () => {
    const fetcher = vi.fn().mockResolvedValue(ok(feedbackFixture));
    vi.stubGlobal("fetch", fetcher);
    await updateFeedbackStatus("1", "resolved", "تم الحل");
    expect(fetcher.mock.calls[0]?.[0]).toBe("/api/feedback/1/status");
    expect(fetcher.mock.calls[0]?.[1]).toEqual(
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({
          status: "resolved",
          admin_note: "تم الحل",
        }),
      }),
    );
  });

  it("maps access, validation, and service failures clearly", () => {
    expect(feedbackErrorMessage(403)).toContain("متاحة للمدير");
    expect(feedbackErrorMessage(404)).toContain("غير موجود");
    expect(feedbackErrorMessage(422)).toContain("غير صالحة");
    expect(feedbackErrorMessage(503)).toContain("غير متاحة");
  });
});
