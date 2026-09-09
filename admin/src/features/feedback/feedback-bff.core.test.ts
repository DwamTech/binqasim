import { describe, expect, it, vi } from "vitest";

import { apiSuccess } from "@/core/api/api-response";
import type { ServerApiClient } from "@/core/api/server-api-client.core";
import {
  getFeedback,
  listFeedback,
  updateFeedbackStatus,
} from "./feedback-bff.core";
import { feedbackFixture } from "./feedback.contracts.test";

function mockClient(result: unknown = apiSuccess(feedbackFixture)) {
  const call = vi.fn().mockResolvedValue(result);
  return {
    call,
    client: { request: call } as unknown as ServerApiClient,
  };
}

describe("feedback BFF", () => {
  it("forwards validated admin list filters with server-only auth", async () => {
    const { client, call } = mockClient(
      apiSuccess({
        current_page: 1,
        data: [],
        last_page: 1,
        per_page: 30,
        total: 0,
      }),
    );
    await listFeedback(
      new Request(
        "https://cms.test/api/feedback?type=complaint&status=new&search=FBK&page=2&per_page=30",
      ),
      client,
      "private-token",
    );
    expect(call).toHaveBeenCalledWith(
      "/admin/feedback-submissions",
      expect.objectContaining({
        authorization: "Bearer private-token",
        query: {
          type: "complaint",
          status: "new",
          search: "FBK",
          page: 2,
          per_page: 30,
        },
      }),
    );
  });

  it("rejects invalid filters, IDs, payloads, and missing sessions", async () => {
    const { client, call } = mockClient();
    expect(
      (
        await listFeedback(
          new Request("https://cms.test/api/feedback?type=rating"),
          client,
          "token",
        )
      ).status,
    ).toBe(422);
    expect((await getFeedback("../1", client, "token")).status).toBe(404);
    expect(
      (
        await updateFeedbackStatus(
          "1",
          new Request("https://cms.test/api/feedback/1/status", {
            method: "PATCH",
            body: JSON.stringify({ status: "unknown" }),
          }),
          client,
          "token",
        )
      ).status,
    ).toBe(422);
    expect(
      (await listFeedback(new Request("https://cms.test/api/feedback"), client))
        .status,
    ).toBe(401);
    expect(call).not.toHaveBeenCalled();
  });

  it("updates status through the confirmed admin endpoint", async () => {
    const { client, call } = mockClient();
    await updateFeedbackStatus(
      "1",
      new Request("https://cms.test/api/feedback/1/status", {
        method: "PATCH",
        body: JSON.stringify({
          status: "under_review",
          admin_note: "جارٍ التواصل",
        }),
      }),
      client,
      "token",
    );
    expect(call).toHaveBeenCalledWith(
      "/admin/feedback-submissions/1/status",
      expect.objectContaining({
        method: "PATCH",
        authorization: "Bearer token",
        body: {
          status: "under_review",
          admin_note: "جارٍ التواصل",
        },
      }),
    );
  });
});
