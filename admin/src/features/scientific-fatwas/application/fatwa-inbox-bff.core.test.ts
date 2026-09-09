import { describe, expect, it, vi } from "vitest";

import { apiSuccess } from "@/core/api/api-response";
import type { ServerApiClient } from "@/core/api/server-api-client.core";
import {
  answerFatwaInboxBff,
  archiveFatwaInboxBff,
  getFatwaInboxDetailBff,
  getFatwaInboxSummaryBff,
  listFatwaInboxBff,
  restoreFatwaInboxBff,
  updateFatwaInboxAnswerBff,
} from "./fatwa-inbox-bff.core";

function mockClient() {
  const call = vi.fn().mockResolvedValue(apiSuccess({}));
  return { call, client: { request: call } as unknown as ServerApiClient };
}

function answerRequest() {
  return new Request(
    "https://dashboard.test/api/scientific-fatwas/inbox/8/answer",
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        answer: "جواب علمي مكتمل للاختبار.",
        visibility: "public",
        question_title: "عنوان المسألة",
        category_id: 4,
        is_listed: true,
      }),
    },
  );
}

describe("fatwa inbox BFF", () => {
  it("allowlists search and status filters", async () => {
    const { client, call } = mockClient();
    await listFatwaInboxBff(
      new Request(
        "https://dashboard.test/api/scientific-fatwas/inbox?search=FTW&status=new&visibility=public&page=2&per_page=50",
      ),
      client,
      "token",
    );
    expect(call).toHaveBeenCalledWith(
      "/admin/fatwas",
      expect.objectContaining({
        query: {
          search: "FTW",
          status: "new",
          visibility: "public",
          page: 2,
          per_page: 50,
        },
      }),
    );
  });

  it("forwards answer, update, archive and restore to exact workflow paths", async () => {
    const { client, call } = mockClient();
    await answerFatwaInboxBff("8", answerRequest(), client, "token");
    await updateFatwaInboxAnswerBff("8", answerRequest(), client, "token");
    await archiveFatwaInboxBff("8", client, "token");
    await restoreFatwaInboxBff("8", client, "token");

    expect(call.mock.calls.map((entry) => [entry[0], entry[1].method])).toEqual(
      [
        ["/admin/fatwas/8/answer", "POST"],
        ["/admin/fatwas/8/answer", "PUT"],
        ["/admin/fatwas/8/archive", "POST"],
        ["/admin/fatwas/8/restore", "POST"],
      ],
    );
  });

  it("forwards detail and summary reads without exposing the token in a browser URL", async () => {
    const { client, call } = mockClient();
    await getFatwaInboxDetailBff("8", client, "private-token");
    await getFatwaInboxSummaryBff(client, "private-token");

    expect(call.mock.calls.map((entry) => entry[0])).toEqual([
      "/admin/fatwas/8",
      "/admin/fatwas/summary",
    ]);
    expect(call.mock.calls[0]?.[1]).toEqual(
      expect.objectContaining({ authorization: "Bearer private-token" }),
    );
  });

  it("rejects missing sessions, invalid filters and unsafe ids locally", async () => {
    const { client, call } = mockClient();
    expect(
      (
        await listFatwaInboxBff(
          new Request("https://dashboard.test/api"),
          client,
        )
      ).status,
    ).toBe(401);
    expect(
      (
        await listFatwaInboxBff(
          new Request("https://dashboard.test/api?status=deleted"),
          client,
          "token",
        )
      ).status,
    ).toBe(422);
    expect((await archiveFatwaInboxBff("../8", client, "token")).status).toBe(
      404,
    );
    expect(call).not.toHaveBeenCalled();
  });
});
