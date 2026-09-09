import { describe, expect, it, vi } from "vitest";

const testEnvironment = vi.hoisted(() => ({
  PUBLIC_FRONTEND_ORIGIN: "https://public.example.com",
}));

vi.mock("server-only", () => ({}));
vi.mock("@/core/env/server", () => ({ serverEnv: testEnvironment }));

import {
  apiFailure,
  apiSuccess,
  type ApiResponse,
} from "@/core/api/api-response";
import type { ServerApiClient } from "@/core/api/server-api-client.core";

import {
  createPage,
  deletePage,
  getPage,
  lifecycle,
  listPages,
  saveDraft,
  uploadMedia,
  createPreview,
  getRevision,
  listRevisions,
  restoreRevision,
} from "./pages-bff.core";

const hero = {
  id: "11111111-1111-4111-8111-111111111111",
  type: "hero" as const,
  version: 1 as const,
  is_visible: true,
  data: { variant: "centered" as const, title: "Hello" },
  settings: { theme: "default" as const, spacing: "medium" as const },
};
const page = {
  id: 1,
  parent_id: null,
  title: "About",
  slug: "about",
  path: "about",
  status: "draft" as const,
  has_unpublished_changes: true,
  published_at: null,
  created_at: null,
  updated_at: null,
  draft: {
    id: 1,
    version: 1,
    title: "About",
    schema_version: 1 as const,
    content: { schema_version: 1 as const, sections: [hero] },
    seo: { description: "preserve" },
    created_at: null,
  },
  published: null,
  media: {},
};
const list = {
  data: [
    {
      id: 1,
      parent_id: null,
      title: "About",
      slug: "about",
      path: "about",
      status: "draft" as const,
      has_unpublished_changes: true,
      published_at: null,
      created_at: null,
      updated_at: null,
    },
  ],
  links: { first: null, last: null, prev: null, next: null },
  meta: { current_page: 1, last_page: 1, per_page: 20, total: 1 },
};

function client(
  result: ApiResponse<unknown> = apiSuccess(page),
): ServerApiClient {
  return {
    request: vi.fn().mockResolvedValue(result),
  } as unknown as ServerApiClient;
}

describe("Pages BFF", () => {
  it("forwards list search, status and pagination only with the server session token", async () => {
    const api = client(apiSuccess(list));
    const result = await listPages(
      new Request(
        "https://dashboard.test/api/pages?search=about&status=draft&page=2&per_page=10",
      ),
      api,
      "private-token",
    );
    expect(result.status).toBe(200);
    expect(api.request).toHaveBeenCalledWith(
      "/admin/pages",
      expect.objectContaining({
        authorization: "Bearer private-token",
        query: { search: "about", status: "draft", page: 2, per_page: 10 },
        cache: "no-store",
      }),
    );
    expect(result.body).toMatchObject({
      success: true,
      data: {
        data: [
          {
            path: "about",
            public_url: "https://public.example.com/pages/about",
          },
        ],
      },
    });
  });

  it("projects an absolute trusted public URL for Page detail responses", async () => {
    const result = await getPage(
      "1",
      client(apiSuccess({ data: page })),
      "private-token",
    );

    expect(result.status).toBe(200);
    expect(result.body).toMatchObject({
      success: true,
      data: {
        data: {
          path: "about",
          public_url: "https://public.example.com/pages/about",
        },
      },
    });
  });

  it("fails closed when an upstream Page path is not canonical", async () => {
    const result = await listPages(
      new Request("https://dashboard.test/api/pages"),
      client(
        apiSuccess({
          ...list,
          data: [{ ...list.data[0], path: "//attacker.example/page" }],
        }),
      ),
      "private-token",
    );

    expect(result.status).toBe(502);
    expect(result.body).toMatchObject({
      success: false,
      error: { code: "INVALID_BACKEND_RESPONSE" },
    });
    expect(JSON.stringify(result.body)).not.toContain("attacker.example");
  });

  it("preserves Laravel failures and rejects missing authentication before Laravel calls", async () => {
    const api = client(apiFailure("AUTH_FORBIDDEN", { status: 403 }));
    expect((await getPage("1", api)).status).toBe(401);
    expect(api.request).not.toHaveBeenCalled();
    expect((await getPage("1", api, "private-token")).status).toBe(403);
  });

  it("maps create, draft, publish, archive and restore to the approved Laravel endpoints", async () => {
    const api = client();
    await createPage(
      new Request("https://dashboard.test/api/pages", {
        method: "POST",
        body: JSON.stringify({ title: "About", slug: "about" }),
        headers: { "content-type": "application/json" },
      }),
      api,
      "token",
    );
    await saveDraft(
      "1",
      new Request("https://dashboard.test/api/pages/1/draft", {
        method: "PUT",
        body: JSON.stringify({
          title: "About",
          content: page.draft.content,
          seo_data: page.draft.seo,
        }),
        headers: { "content-type": "application/json" },
      }),
      api,
      "token",
    );
    await lifecycle("1", "publish", api, "token");
    await lifecycle("1", "archive", api, "token");
    await lifecycle("1", "restore-from-archive", api, "token");
    await deletePage("1", api, "token");
    expect(api.request).toHaveBeenNthCalledWith(
      1,
      "/admin/pages",
      expect.objectContaining({ method: "POST" }),
    );
    expect(api.request).toHaveBeenNthCalledWith(
      2,
      "/admin/pages/1/draft",
      expect.objectContaining({
        method: "PUT",
        body: expect.objectContaining({
          seo_data: { description: "preserve" },
        }),
      }),
    );
    expect(api.request).toHaveBeenNthCalledWith(
      3,
      "/admin/pages/1/publish",
      expect.objectContaining({ method: "POST" }),
    );
    expect(api.request).toHaveBeenNthCalledWith(
      4,
      "/admin/pages/1/archive",
      expect.objectContaining({ method: "POST" }),
    );
    expect(api.request).toHaveBeenNthCalledWith(
      5,
      "/admin/pages/1/restore-from-archive",
      expect.objectContaining({ method: "POST" }),
    );
    expect(api.request).toHaveBeenNthCalledWith(
      6,
      "/admin/pages/1",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("returns exact field paths when a Page draft fails BFF validation", async () => {
    const result = await saveDraft(
      "1",
      new Request("https://dashboard.test/api/pages/1/draft", {
        method: "PUT",
        body: JSON.stringify({
          title: "About",
          content: {
            schema_version: 1,
            sections: [
              {
                ...hero,
                type: "gallery",
                data: {
                  variant: "grid",
                  items: [
                    {
                      id: "not-a-uuid",
                      media_id: 1,
                      alt: "Gallery image",
                      caption: null,
                    },
                  ],
                },
              },
            ],
          },
          seo_data: {},
        }),
        headers: { "content-type": "application/json" },
      }),
      client(),
      "token",
    );

    expect(result.status).toBe(422);
    expect(result.body).toMatchObject({
      success: false,
      error: {
        fieldErrors: {
          "content.sections.0.data.items.0.id": ["Invalid UUID"],
        },
      },
    });
  });

  it("streams multipart image uploads to the Page-scoped backend endpoint", async () => {
    const api = client(
      apiSuccess({
        data: {
          id: 2,
          type: "image",
          url: "https://cdn.test/pages/2.webp",
          mime_type: "image/webp",
          name: "hero.webp",
          size: 12,
        },
      }),
    );
    const form = new FormData();
    form.set("file", new File(["image"], "hero.webp", { type: "image/webp" }));
    form.set("type", "image");
    const result = await uploadMedia(
      "1",
      new Request("https://dashboard.test/api/pages/1/media", {
        method: "POST",
        body: form,
      }),
      api,
      "private-token",
    );
    expect(result.status).toBe(201);
    expect(api.request).toHaveBeenCalledWith(
      "/admin/pages/1/media",
      expect.objectContaining({
        method: "POST",
        authorization: "Bearer private-token",
        bodyStream: expect.any(ReadableStream),
      }),
    );
  });
  it("uses the Pages BFF for preview creation without saving or publishing", async () => {
    const api = client(
      apiSuccess({
        data: {
          token: "a".repeat(64),
          expires_at: "2026-08-28T12:00:00Z",
          preview_url: "/pages-preview/" + "b".repeat(64),
        },
      }),
    );
    const result = await createPreview("1", api, "private-token");
    expect(result.status).toBe(201);
    expect(result.body).toMatchObject({
      success: true,
      data: {
        data: {
          token: "a".repeat(64),
          preview_url:
            "https://public.example.com/pages-preview/" + "a".repeat(64),
        },
      },
    });
    expect(api.request).toHaveBeenCalledWith(
      "/admin/pages/1/preview",
      expect.objectContaining({
        method: "POST",
        authorization: "Bearer private-token",
        cache: "no-store",
      }),
    );
  });
  it("maps paginated history, detail, and restore through only Pages BFF endpoints", async () => {
    const history = {
      data: [
        {
          id: 2,
          version: 2,
          title: "Second",
          created_at: null,
          published_at: null,
          is_current_draft: true,
          is_current_published: false,
          was_published: false,
        },
      ],
      links: { first: null, last: null, prev: null, next: null },
      meta: { current_page: 2, last_page: 2, per_page: 20, total: 21 },
    };
    const api = client(apiSuccess(history));
    await listRevisions(
      "1",
      new Request("https://dashboard.test/api/pages/1/revisions?page=2"),
      api,
      "token",
    );
    await getRevision("1", "2", api, "token");
    await restoreRevision("1", "2", api, "token");
    expect(api.request).toHaveBeenNthCalledWith(
      1,
      "/admin/pages/1/revisions",
      expect.objectContaining({
        authorization: "Bearer token",
        query: { page: "2" },
        cache: "no-store",
      }),
    );
    expect(api.request).toHaveBeenNthCalledWith(
      2,
      "/admin/pages/1/revisions/2",
      expect.objectContaining({
        authorization: "Bearer token",
        cache: "no-store",
      }),
    );
    expect(api.request).toHaveBeenNthCalledWith(
      3,
      "/admin/pages/1/revisions/2/restore",
      expect.objectContaining({
        method: "POST",
        authorization: "Bearer token",
        cache: "no-store",
      }),
    );
    expect((await restoreRevision("1", "2", api)).status).toBe(401);
  });
});
