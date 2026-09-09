import { describe, expect, it, vi } from "vitest";

import { apiSuccess } from "@/core/api/api-response";
import type { ServerApiClient } from "@/core/api/server-api-client.core";
import {
  createHadithCardBff,
  listHadithCardProjectsBff,
  updateHadithCardBff,
} from "./hadith-cards-bff.core";

function mockClient(result: unknown = apiSuccess({})) {
  const call = vi.fn().mockResolvedValue(result);
  return {
    call,
    client: { request: call } as unknown as ServerApiClient,
  };
}

const card = {
  id: "12",
  hadith_card_project_id: "7",
  slug: "card-12",
  title: "بطاقة حديثية",
  alt_text: "وصف البطاقة",
  image_source_type: "url" as const,
  image_source_url: "https://images.example/card.webp",
  image_url: "https://images.example/card.webp",
  sort_order: 1,
  is_published: true,
  published_at: "2026-08-10T10:00:00.000000Z",
  status: "published" as const,
  views_count: 0,
  created_at: null,
  updated_at: null,
};

function cardRequest() {
  const form = new FormData();
  form.set("hadith_card_project_id", "7");
  form.set("alt_text", "وصف البطاقة");
  form.set("image_source_type", "url");
  form.set("image_url", "https://images.example/card.webp");
  return new Request("https://dashboard.test/api/hadith-cards/cards", {
    method: "POST",
    body: form,
  });
}

describe("hadith cards BFF", () => {
  it("allowlists project filters and uses the projects paginator", async () => {
    const { client, call } = mockClient(
      apiSuccess({
        data: [],
        meta: { current_page: 2, last_page: 2, per_page: 40, total: 40 },
        stats: { total: 40, published: 20, drafts: 10, cards: 120 },
        filter_options: { accents: [], statuses: [] },
      }),
    );
    const result = await listHadithCardProjectsBff(
      new Request(
        "https://dashboard.test/api/hadith-cards/projects?search=%D8%AD%D8%AF%D9%8A%D8%AB&accent=blue&status=published&page=2&per_page=40",
      ),
      client,
      "private-token",
    );

    expect(result.status).toBe(200);
    expect(call).toHaveBeenCalledWith(
      "/admin/hadith-cards/projects",
      expect.objectContaining({
        authorization: "Bearer private-token",
        query: {
          search: "حديث",
          accent: "blue",
          status: "published",
          page: 2,
          per_page: 40,
        },
      }),
    );
  });

  it("requires a valid session and accepted query values", async () => {
    const { client, call } = mockClient();
    expect((await createHadithCardBff(cardRequest(), client)).status).toBe(401);
    expect(
      (
        await listHadithCardProjectsBff(
          new Request(
            "https://dashboard.test/api/hadith-cards/projects?status=hidden",
          ),
          client,
          "token",
        )
      ).status,
    ).toBe(422);
    expect(call).not.toHaveBeenCalled();
  });

  it("forwards card edits as multipart POST with Laravel PATCH override", async () => {
    const { client, call } = mockClient(
      apiSuccess({ message: "saved", data: card }),
    );
    const result = await updateHadithCardBff(
      "12",
      cardRequest(),
      client,
      "token",
    );

    expect(result.status).toBe(200);
    expect(call).toHaveBeenCalledWith(
      "/admin/hadith-cards/cards/12",
      expect.objectContaining({
        method: "POST",
        multipartMethodOverride: "PATCH",
        authorization: "Bearer token",
      }),
    );
  });
});
