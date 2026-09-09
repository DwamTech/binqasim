import { describe, expect, it, vi } from "vitest";

import { apiSuccess } from "@/core/api/api-response";
import type { ServerApiClient } from "@/core/api/server-api-client.core";
import { reviewLibraryIndexSubmissionBff } from "./library-indexes-bff.core";

const item = {
  id: 4,
  type: "golden_visit" as const,
  name: "زائر",
  title: null,
  visit_date: "2026-08-09",
  status: "approved" as const,
  image_url: "/storage/example.webp",
  reviewed_at: "2026-08-09T12:00:00Z",
  reviewer: { id: 1, name: "المدير" },
  rejection_reason: null,
  created_at: "2026-08-09T10:00:00Z",
};

function mockClient() {
  const call = vi.fn().mockResolvedValue(apiSuccess(item));
  return { call, client: { request: call } as unknown as ServerApiClient };
}

function request(body: object = {}) {
  return new Request("https://dashboard.test/api/library-indexes", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("library indexes review BFF", () => {
  it("forwards approve to its exact typed workflow endpoint", async () => {
    const { call, client } = mockClient();
    const result = await reviewLibraryIndexSubmissionBff(
      "golden_visit",
      "4",
      "approve",
      request(),
      client,
      "private-token",
      "https://back.example.test/api",
    );
    expect(result.status).toBe(200);
    expect(result.body).toMatchObject({
      success: true,
      data: {
        image_url: "https://back.example.test/storage/example.webp",
      },
    });
    expect(call).toHaveBeenCalledWith(
      "/admin/library-indexes/submissions/golden_visit/4/approve",
      expect.objectContaining({
        method: "POST",
        authorization: "Bearer private-token",
        body: {},
      }),
    );
  });

  it("validates and forwards the rejection reason", async () => {
    const { call, client } = mockClient();
    await reviewLibraryIndexSubmissionBff(
      "guest",
      "8",
      "reject",
      request({ rejection_reason: "البيانات غير مكتملة" }),
      client,
      "private-token",
    );
    expect(call).toHaveBeenCalledWith(
      "/admin/library-indexes/submissions/guest/8/reject",
      expect.objectContaining({
        body: { rejection_reason: "البيانات غير مكتملة" },
      }),
    );
  });

  it("rejects missing sessions, unsafe paths and short reasons locally", async () => {
    const { call, client } = mockClient();
    expect(
      (
        await reviewLibraryIndexSubmissionBff(
          "guest",
          "8",
          "approve",
          request(),
          client,
        )
      ).status,
    ).toBe(401);
    expect(
      (
        await reviewLibraryIndexSubmissionBff(
          "unknown",
          "8",
          "approve",
          request(),
          client,
          "token",
        )
      ).status,
    ).toBe(404);
    expect(
      (
        await reviewLibraryIndexSubmissionBff(
          "guest",
          "../8",
          "approve",
          request(),
          client,
          "token",
        )
      ).status,
    ).toBe(404);
    expect(
      (
        await reviewLibraryIndexSubmissionBff(
          "guest",
          "8",
          "reject",
          request({ rejection_reason: "لا" }),
          client,
          "token",
        )
      ).status,
    ).toBe(422);
    expect(call).not.toHaveBeenCalled();
  });
});
