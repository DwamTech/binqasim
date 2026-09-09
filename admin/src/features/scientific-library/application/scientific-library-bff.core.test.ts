import { describe, expect, it, vi } from "vitest";

import { apiSuccess } from "@/core/api/api-response";
import type { ServerApiClient } from "@/core/api/server-api-client.core";
import { emptyScientificLibraryForm } from "../domain/scientific-library.contracts";
import { createScientificLibraryFormData } from "./scientific-library.form";
import {
  createScientificLibraryItem,
  getScientificLibraryOptions,
  listScientificLibraryItems,
  updateScientificLibraryItem,
} from "./scientific-library-bff.core";

function mockClient(result: unknown = apiSuccess({})) {
  const call = vi.fn().mockResolvedValue(result);
  return {
    call,
    client: { request: call } as unknown as ServerApiClient,
  };
}

const values = {
  ...emptyScientificLibraryForm,
  slug: "hadith-work",
  title: "مصنَّف الحديث",
  author_name: "المؤلف",
  description: "وصف المصنَّف",
  content_type: "الكتب والمؤلفات",
  scientific_field: "مصطلح الحديث",
  pages_count: "248",
  edition: "الطبعة الأولى",
};

function request(withFile = true) {
  return new Request("https://dashboard.test/api/scientific-library/items", {
    method: "POST",
    body: createScientificLibraryFormData(
      values,
      withFile ? { file: new File(["pdf"], "work.pdf") } : {},
    ),
  });
}

describe("scientific library BFF", () => {
  it("allowlists every management filter and uses the resource paginator", async () => {
    const { client, call } = mockClient(
      apiSuccess({
        data: [],
        links: { first: null, last: null, prev: null, next: null },
        meta: {
          current_page: 1,
          last_page: 1,
          per_page: 40,
          total: 0,
          from: null,
          to: null,
        },
      }),
    );
    const result = await listScientificLibraryItems(
      new Request(
        "https://dashboard.test/api/scientific-library/items?search=hadith&content_type=book&scientific_field=hadith&status=scheduled&source_type=embed&is_featured=1&page=2&per_page=40",
      ),
      client,
      "private-token",
    );
    expect(result.status).toBe(200);
    expect(call).toHaveBeenCalledWith(
      "/admin/scientific-library/items",
      expect.objectContaining({
        authorization: "Bearer private-token",
        query: {
          search: "hadith",
          content_type: "book",
          scientific_field: "hadith",
          status: "scheduled",
          source_type: "embed",
          is_featured: "1",
          page: 2,
          per_page: 40,
        },
      }),
    );
  });

  it("rejects missing sessions, invalid query values, and invalid create files", async () => {
    const { client, call } = mockClient();
    expect((await createScientificLibraryItem(request(), client)).status).toBe(
      401,
    );
    expect(
      (
        await listScientificLibraryItems(
          new Request(
            "https://dashboard.test/api/scientific-library/items?status=hidden",
          ),
          client,
          "token",
        )
      ).status,
    ).toBe(422);
    expect(
      (await createScientificLibraryItem(request(false), client, "token"))
        .status,
    ).toBe(422);
    expect(call).not.toHaveBeenCalled();
  });

  it("forwards sanitized multipart create and Laravel PATCH override", async () => {
    const { client, call } = mockClient(
      apiSuccess({ message: "saved", data: { id: 1 } }),
    );
    expect(
      (await createScientificLibraryItem(request(), client, "token")).status,
    ).toBe(201);
    await updateScientificLibraryItem("8", request(false), client, "token");
    expect(call.mock.calls[0]?.[0]).toBe("/admin/scientific-library/items");
    expect(call.mock.calls[0]?.[1]).toEqual(
      expect.objectContaining({ method: "POST", timeoutMs: 120_000 }),
    );
    expect(call.mock.calls[1]?.[0]).toBe("/admin/scientific-library/items/8");
    expect(call.mock.calls[1]?.[1]).toEqual(
      expect.objectContaining({
        method: "POST",
        multipartMethodOverride: "PATCH",
      }),
    );
    const forwarded = call.mock.calls[0]?.[1]?.body as FormData;
    expect(forwarded.get("file_path")).toBeInstanceOf(File);
    expect(forwarded.has("file")).toBe(false);
  });

  it("uses the dedicated options endpoint", async () => {
    const { client, call } = mockClient(
      apiSuccess({
        content_types: [],
        scientific_fields: [],
        source_types: [],
        statuses: [],
      }),
    );
    expect((await getScientificLibraryOptions(client, "token")).status).toBe(
      200,
    );
    expect(call.mock.calls[0]?.[0]).toBe("/admin/scientific-library/options");
  });
});
