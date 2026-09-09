import { describe, expect, it, vi } from "vitest";

import { apiFailure, apiSuccess } from "../../core/api/api-response";
import type { ServerApiClient } from "../../core/api/server-api-client.core";
import {
  createArticle,
  deleteArticleFeaturedImage,
  deleteArticleMedia,
  getArticle,
  getArticleCatalogs,
  listArticles,
  toggleArticleStatus,
  updateArticle,
} from "./articles-bff.core";
import { articleFixture } from "./articles.contracts.test";

function mockClient(result: unknown = apiSuccess({})) {
  const call = vi.fn().mockResolvedValue(result);
  return {
    call,
    client: { request: call } as unknown as ServerApiClient,
  };
}

function multipartRequest(url: string): Request {
  const form = new FormData();
  form.set("title", "Article");
  form.set("slug", "article");
  form.set("content", "Body");
  form.set("status", "draft");
  form.set(
    "file",
    new File(["content"], "doc.pdf", { type: "application/pdf" }),
  );
  return new Request(url, { method: "POST", body: form });
}

describe("articles BFF", () => {
  it("forwards all validated list filters only to management reads", async () => {
    const { client, call } = mockClient(
      apiSuccess({ data: [], links: {}, meta: {} }),
    );
    const result = await listArticles(
      new Request(
        "https://cms.test/api/articles?search=news&section_id=2&status=draft&author=7&date=2026-07-28&page=2&per_page=50",
      ),
      client,
      "private-token",
    );
    expect(result.status).toBe(200);
    expect(call).toHaveBeenCalledWith(
      "/admin/articles",
      expect.objectContaining({
        authorization: "Bearer private-token",
        query: {
          search: "news",
          section_id: "2",
          status: "draft",
          author: "7",
          date: "2026-07-28",
          page: 2,
          per_page: 50,
        },
      }),
    );
    expect(call).not.toHaveBeenCalledWith("/articles", expect.anything());
  });

  it("rejects missing sessions, invalid filters and path traversal before Laravel", async () => {
    const { client, call } = mockClient();
    expect(
      (await listArticles(new Request("https://cms.test/api/articles"), client))
        .status,
    ).toBe(401);
    expect(
      (
        await listArticles(
          new Request("https://cms.test/api/articles?status=hidden"),
          client,
          "token",
        )
      ).status,
    ).toBe(422);
    expect((await getArticle("../1", client, "token")).status).toBe(404);
    expect(
      (await deleteArticleMedia("1", "../2", client, "token")).status,
    ).toBe(404);
    expect(
      (await deleteArticleFeaturedImage("../1", client, "token")).status,
    ).toBe(404);
    expect(call).not.toHaveBeenCalled();
  });

  it("forwards featured image deletion through the authenticated backend contract", async () => {
    const { client, call } = mockClient(
      apiSuccess({ message: "featured image deleted" }),
    );

    const result = await deleteArticleFeaturedImage("12", client, "token");

    expect(result.status).toBe(200);
    expect(call).toHaveBeenCalledWith(
      "/articles/12/featured-image",
      expect.objectContaining({
        method: "DELETE",
        authorization: "Bearer token",
        cache: "no-store",
      }),
    );
  });

  it("streams multipart uploads with their original headers and a long timeout", async () => {
    const { client, call } = mockClient(
      apiSuccess({ message: "created", article: articleFixture }),
    );
    const request = multipartRequest("https://cms.test/api/articles");
    const result = await createArticle(
      request,
      client,
      "token",
    );
    expect(result.status).toBe(201);
    const options = call.mock.calls[0]?.[1] as Record<string, unknown>;
    expect(call.mock.calls[0]?.[0]).toBe("/articles");
    expect(options.bodyStream).toBe(request.body);
    expect(options.body).toBeUndefined();
    expect(
      new Headers(options.headers as HeadersInit).get("content-type"),
    ).toContain("multipart/form-data; boundary=");
    expect(options.timeoutMs).toBe(900_000);
    expect(options.authorization).toBe("Bearer token");
  });

  it("uses a query method override without rebuilding update uploads", async () => {
    const { client, call } = mockClient(
      apiSuccess({ message: "updated", article: articleFixture }),
    );
    await updateArticle(
      "1",
      multipartRequest("https://cms.test/api/articles/1"),
      client,
      "token",
    );
    expect(call).toHaveBeenCalledWith(
      "/articles/1",
      expect.objectContaining({
        method: "POST",
        query: { _method: "PUT" },
        bodyStream: expect.any(ReadableStream),
        timeoutMs: 900_000,
      }),
    );
  });

  it("loads active sections and protected authors in parallel catalogs", async () => {
    const call = vi.fn(async (path: string) =>
      path === "/sections"
        ? apiSuccess([articleFixture.section])
        : apiSuccess({ data: [articleFixture.author] }),
    );
    const result = await getArticleCatalogs(
      { request: call } as unknown as ServerApiClient,
      "token",
    );
    expect(result.status).toBe(200);
    expect(call).toHaveBeenCalledWith(
      "/sections",
      expect.objectContaining({ query: { module: "articles" } }),
    );
    expect(call).toHaveBeenCalledWith(
      "/admin/articles/authors",
      expect.objectContaining({ authorization: "Bearer token" }),
    );
  });

  it("preserves authorization, payload, rate and server failures safely", async () => {
    for (const status of [403, 404, 413, 422, 429, 500, 503]) {
      const { client } = mockClient(apiFailure("UNKNOWN_ERROR", { status }));
      const result = await toggleArticleStatus("1", client, "token");
      expect(result.status).toBe(status);
      expect(JSON.stringify(result.body)).not.toMatch(
        /private-token|password|remember_token|internal_path/,
      );
    }
  });
});
