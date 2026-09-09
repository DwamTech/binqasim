import { describe, expect, it, vi } from "vitest";

import { apiSuccess } from "@/core/api/api-response";
import type { ServerApiClient } from "@/core/api/server-api-client.core";
import {
  createScientificFatwaBff,
  createScientificFatwaCategoryBff,
  deleteScientificFatwaBff,
  deleteScientificFatwaCategoryBff,
  getScientificFatwaBff,
  listScientificFatwasBff,
  listScientificFatwaCategoriesBff,
  updateScientificFatwaCategoryBff,
  updateScientificFatwaBff,
} from "./scientific-fatwas-bff.core";

function mockClient(result: unknown = apiSuccess({})) {
  const call = vi.fn().mockResolvedValue(result);
  return { call, client: { request: call } as unknown as ServerApiClient };
}

function mutationRequest() {
  const body = new FormData();
  body.set("title", "مسألة علمية");
  body.set("question", "نص السؤال العلمي");
  body.set("answer", "نص الجواب العلمي");
  return new Request("https://dashboard.test/api/scientific-fatwas/items", {
    method: "POST",
    body,
  });
}

describe("scientific fatwas BFF", () => {
  it("allowlists management filters and forwards the authenticated request", async () => {
    const { client, call } = mockClient();
    const result = await listScientificFatwasBff(
      new Request(
        "https://dashboard.test/api/scientific-fatwas/items?search=hadith&category=mustalah&status=scheduled&is_featured=1&is_listed=0&page=2&per_page=40",
      ),
      client,
      "private-token",
    );

    expect(result.status).toBe(200);
    expect(call).toHaveBeenCalledWith(
      "/admin/scientific-fatwas/items",
      expect.objectContaining({
        authorization: "Bearer private-token",
        query: {
          search: "hadith",
          category: "mustalah",
          status: "scheduled",
          is_featured: "1",
          is_listed: "0",
          page: 2,
          per_page: 40,
        },
      }),
    );
  });

  it("rejects missing sessions, invalid filters and unsafe identifiers locally", async () => {
    const { client, call } = mockClient();

    expect(
      (
        await listScientificFatwasBff(
          new Request("https://dashboard.test/api/scientific-fatwas/items"),
          client,
        )
      ).status,
    ).toBe(401);
    expect(
      (
        await listScientificFatwasBff(
          new Request(
            "https://dashboard.test/api/scientific-fatwas/items?status=hidden",
          ),
          client,
          "token",
        )
      ).status,
    ).toBe(422);
    expect(
      (await getScientificFatwaBff("../private", client, "token")).status,
    ).toBe(404);
    expect(call).not.toHaveBeenCalled();
  });

  it("forwards create, Laravel PATCH override and delete with exact resource paths", async () => {
    const { client, call } = mockClient();

    expect(
      (await createScientificFatwaBff(mutationRequest(), client, "token"))
        .status,
    ).toBe(201);
    await updateScientificFatwaBff("17", mutationRequest(), client, "token");
    await deleteScientificFatwaBff("17", client, "token");

    expect(call.mock.calls[0]?.[0]).toBe("/admin/scientific-fatwas/items");
    expect(call.mock.calls[0]?.[1]).toEqual(
      expect.objectContaining({ method: "POST" }),
    );
    expect(call.mock.calls[1]?.[0]).toBe("/admin/scientific-fatwas/items/17");
    expect(call.mock.calls[1]?.[1]).toEqual(
      expect.objectContaining({
        method: "POST",
        multipartMethodOverride: "PATCH",
      }),
    );
    expect(call.mock.calls[2]?.[0]).toBe("/admin/scientific-fatwas/items/17");
    expect(call.mock.calls[2]?.[1]).toEqual(
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("forwards category CRUD to the dedicated category resource", async () => {
    const { client, call } = mockClient();
    const request = new Request(
      "https://dashboard.test/api/scientific-fatwas/categories",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: "علل الحديث", is_active: true }),
      },
    );

    await listScientificFatwaCategoriesBff(client, "token");
    await createScientificFatwaCategoryBff(request.clone(), client, "token");
    await updateScientificFatwaCategoryBff(
      "4",
      request.clone(),
      client,
      "token",
    );
    await deleteScientificFatwaCategoryBff("4", client, "token");

    expect(call.mock.calls.map((entry) => entry[0])).toEqual([
      "/admin/scientific-fatwas/categories",
      "/admin/scientific-fatwas/categories",
      "/admin/scientific-fatwas/categories/4",
      "/admin/scientific-fatwas/categories/4",
    ]);
  });
});
