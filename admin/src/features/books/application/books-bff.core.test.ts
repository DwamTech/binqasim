import { describe, expect, it, vi } from "vitest";

import { apiSuccess } from "@/core/api/api-response";
import type { ServerApiClient } from "@/core/api/server-api-client.core";
import {
  createBook,
  deleteBook,
  listBooks,
  updateBook,
} from "./books-bff.core";

function mockClient(result: unknown = apiSuccess({})) {
  const call = vi.fn().mockResolvedValue(result);
  return {
    call,
    client: { request: call } as unknown as ServerApiClient,
  };
}

function multipartRequest(): Request {
  const body = new FormData();
  body.set("title", "Book");
  return new Request("https://cms.test/api/books", {
    method: "POST",
    body,
  });
}

describe("books BFF operations", () => {
  it("forwards only supported management filters", async () => {
    const { client, call } = mockClient(
      apiSuccess({ current_page: 1, data: [], per_page: 20, total: 0 }),
    );
    await listBooks(
      new Request(
        "https://cms.test/api/books?section_id=2&series_id=3&type=part&page=4&search=ignored",
      ),
      client,
      "private-token",
    );
    expect(call).toHaveBeenCalledWith(
      "/admin/library/books",
      expect.objectContaining({
        authorization: "Bearer private-token",
        query: { section_id: "2", series_id: "3", type: "part", page: "4" },
      }),
    );
  });

  it("rejects invalid IDs, filters, and missing sessions before Laravel", async () => {
    const { client, call } = mockClient();
    expect(
      (
        await listBooks(
          new Request("https://cms.test/api/books?type=unknown"),
          client,
          "token",
        )
      ).status,
    ).toBe(422);
    expect((await deleteBook("../1", client, "token")).status).toBe(404);
    expect((await deleteBook("1", client)).status).toBe(401);
    expect(call).not.toHaveBeenCalled();
  });

  it("forwards multipart create and PATCH method override safely", async () => {
    const { client, call } = mockClient(
      apiSuccess({ message: "saved", data: { id: 1 } }),
    );
    expect((await createBook(multipartRequest(), client, "token")).status).toBe(
      201,
    );
    await updateBook("1", multipartRequest(), client, "token");
    expect(call.mock.calls[0]?.[0]).toBe("/admin/library/books");
    expect(call.mock.calls[0]?.[1]).toEqual(
      expect.objectContaining({ method: "POST", timeoutMs: 120_000 }),
    );
    expect(call.mock.calls[1]?.[0]).toBe("/admin/library/books/1");
    expect(call.mock.calls[1]?.[1]).toEqual(
      expect.objectContaining({
        method: "POST",
        multipartMethodOverride: "PATCH",
        timeoutMs: 120_000,
      }),
    );
  });
});
