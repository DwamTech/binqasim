import { describe, expect, it, vi } from "vitest";

import { apiSuccess } from "@/core/api/api-response";
import type { ServerApiClient } from "@/core/api/server-api-client.core";
import {
  approveCommentBff,
  bulkDeleteCommentsBff,
  deleteCommentBff,
  getCommentOptionsBff,
  getCommentsStatsBff,
  listCommentsBff,
} from "./comments-bff.core";

function mockClient() {
  const call = vi.fn().mockResolvedValue(apiSuccess({}));
  return { call, client: { request: call } as unknown as ServerApiClient };
}

describe("comments dashboard BFF", () => {
  it("forwards the allowlisted list query and catalogue endpoints", async () => {
    const { call, client } = mockClient();
    const result = await listCommentsBff(
      new Request(
        "https://dashboard.test/api/comments?search=حديث&status=pending&target_type=site_article&page=2&per_page=50",
      ),
      client,
      "private-token",
    );
    expect(result.status).toBe(200);
    expect(call).toHaveBeenCalledWith(
      "/admin/comments",
      expect.objectContaining({
        authorization: "Bearer private-token",
        query: {
          search: "حديث",
          status: "pending",
          target_type: "site_article",
          page: 2,
          per_page: 50,
        },
      }),
    );

    await getCommentOptionsBff(client, "private-token");
    await getCommentsStatsBff(client, "private-token");
    expect(call.mock.calls[1]?.[0]).toBe("/admin/comments/options");
    expect(call.mock.calls[2]?.[0]).toBe("/admin/comments/stats");
  });

  it("uses dedicated approve, hard-delete and bulk-delete endpoints", async () => {
    const { call, client } = mockClient();
    await approveCommentBff("12", client, "token");
    await deleteCommentBff("12", client, "token");
    await bulkDeleteCommentsBff(
      new Request("https://dashboard.test/api/comments/bulk-delete", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ids: [12, 15] }),
      }),
      client,
      "token",
    );

    expect(call.mock.calls[0]).toEqual([
      "/admin/comments/12/approve",
      expect.objectContaining({ method: "POST", body: {} }),
    ]);
    expect(call.mock.calls[1]).toEqual([
      "/admin/comments/12",
      expect.objectContaining({ method: "DELETE" }),
    ]);
    expect(call.mock.calls[2]).toEqual([
      "/admin/comments/bulk-delete",
      expect.objectContaining({ method: "POST", body: { ids: [12, 15] } }),
    ]);
  });

  it("rejects missing sessions, unsafe IDs and invalid bulk bodies locally", async () => {
    const { call, client } = mockClient();
    expect(
      (
        await listCommentsBff(
          new Request("https://dashboard.test/api/comments"),
          client,
        )
      ).status,
    ).toBe(401);
    expect((await approveCommentBff("../12", client, "token")).status).toBe(
      404,
    );
    expect(
      (
        await bulkDeleteCommentsBff(
          new Request("https://dashboard.test/api/comments/bulk-delete", {
            method: "POST",
            body: JSON.stringify({ ids: [1, 1] }),
          }),
          client,
          "token",
        )
      ).status,
    ).toBe(422);
    expect(call).not.toHaveBeenCalled();
  });
});
