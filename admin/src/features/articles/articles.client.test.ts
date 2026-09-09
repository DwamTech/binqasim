import { afterEach, describe, expect, it, vi } from "vitest";

import {
  articleErrorMessage,
  ArticlesClientError,
  createArticle,
  deleteArticle,
  deleteArticleFeaturedImage,
  deleteArticleMedia,
  listArticles,
  updateArticle,
} from "./articles.client";
import { emptyArticleForm } from "./articles.contracts";
import { articleFixture } from "./articles.contracts.test";

afterEach(() => vi.unstubAllGlobals());

const ok = (data: unknown) => Response.json({ success: true, data });

describe("articles browser client", () => {
  it("keeps list filtering in the same-origin BFF URL", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      ok({
        data: [],
        links: {},
        meta: { current_page: 2, last_page: 2, per_page: 20, total: 21 },
      }),
    );
    vi.stubGlobal("fetch", fetcher);
    await listArticles({
      search: "news",
      status: "draft",
      page: 2,
      per_page: 20,
    });
    expect(fetcher.mock.calls[0]?.[0]).toBe(
      "/api/articles?search=news&status=draft&page=2",
    );
  });

  it("forwards multipart create/update without Authorization or content-type", async () => {
    const fetcher = vi
      .fn()
      .mockImplementation(() =>
        Promise.resolve(ok({ message: "saved", article: articleFixture })),
      );
    vi.stubGlobal("fetch", fetcher);
    const values = {
      ...emptyArticleForm,
      title: "Article",
      slug: "article",
      content: "Body",
    };
    const noFiles = {
      galleryImages: [],
      audioFiles: [],
      documents: [],
      videos: [],
    };
    await createArticle(values, noFiles);
    await updateArticle("1", values, noFiles);
    for (const [, options] of fetcher.mock.calls as [string, RequestInit][]) {
      expect(options.body).toBeInstanceOf(FormData);
      const headers = new Headers(options.headers);
      expect(headers.has("authorization")).toBe(false);
      expect(headers.has("content-type")).toBe(false);
      if (headers.has("x-article-trace-id")) {
        expect(headers.get("x-article-trace-id")).toMatch(
          /^[0-9a-f-]+$|^article-\d+$/,
        );
      }
      expect(JSON.stringify(options)).not.toMatch(
        /authorization|bearer|token/i,
      );
    }
    expect((fetcher.mock.calls[1]?.[1] as RequestInit).method).toBe("PATCH");
  });

  it("uploads any number of gallery images as independent bounded requests", async () => {
    const fetcher = vi
      .fn()
      .mockImplementation(() =>
        Promise.resolve(ok({ message: "saved", article: articleFixture })),
      );
    vi.stubGlobal("fetch", fetcher);
    const images = ["one.jpg", "two.jpg", "three.jpg", "four.jpg"].map(
      (name) => new File(["image"], name, { type: "image/jpeg" }),
    );
    const audioFiles = [
      new File(["audio"], "one.mp3", { type: "audio/mpeg" }),
      new File(["audio"], "two.mp3", { type: "audio/mpeg" }),
    ];
    const documents = [
      new File(["document"], "one.pdf", { type: "application/pdf" }),
    ];
    const videos = [new File(["video"], "one.mp4", { type: "video/mp4" })];
    await createArticle(
      {
        ...emptyArticleForm,
        title: "Article",
        slug: "article",
        content: "Body",
      },
      { galleryImages: images, audioFiles, documents, videos },
    );

    expect(fetcher).toHaveBeenCalledTimes(9);
    const coreBody = fetcher.mock.calls[0]?.[1]?.body as FormData;
    expect(coreBody.getAll("gallery_images[]")).toHaveLength(0);
    expect(coreBody.getAll("audio_files[]")).toHaveLength(0);
    expect(coreBody.getAll("documents[]")).toHaveLength(0);
    expect(coreBody.getAll("videos[]")).toHaveLength(0);
    const uploadBodies = fetcher.mock.calls
      .slice(1)
      .map(([, options]) => (options as RequestInit).body as FormData);
    expect(
      uploadBodies.flatMap((body) => body.getAll("gallery_images[]")),
    ).toHaveLength(4);
    expect(
      uploadBodies.flatMap((body) => body.getAll("audio_files[]")),
    ).toHaveLength(2);
    expect(
      uploadBodies.flatMap((body) => body.getAll("documents[]")),
    ).toHaveLength(1);
    expect(
      uploadBodies.flatMap((body) => body.getAll("videos[]")),
    ).toHaveLength(1);
    for (const [, options] of fetcher.mock.calls.slice(1) as [
      string,
      RequestInit,
    ][]) {
      expect(options.method).toBe("PATCH");
    }
  });

  it("uses non-optimistic DELETE and maps every important status safely", async () => {
    expect(articleErrorMessage(403)).toContain("صلاحية");
    expect(articleErrorMessage(404)).toContain("غير موجود");
    expect(articleErrorMessage(413)).toContain("حجم");
    expect(articleErrorMessage(422)).toContain("البيانات");
    expect(articleErrorMessage(429)).toContain("انتظر");
    expect(articleErrorMessage(503)).toContain("غير متاحة");

    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          Response.json(
            { success: false, error: { fieldErrors: { slug: ["duplicate"] } } },
            { status: 422 },
          ),
        ),
    );
    await expect(deleteArticle("1")).rejects.toMatchObject({
      status: 422,
      fieldErrors: { slug: ["duplicate"] },
    } satisfies Partial<ArticlesClientError>);
  });

  it("deletes existing article media through same-origin BFF endpoints", async () => {
    const fetcher = vi
      .fn()
      .mockImplementation(() => Promise.resolve(ok({ message: "deleted" })));
    vi.stubGlobal("fetch", fetcher);

    await deleteArticleMedia("12", "8");
    await deleteArticleFeaturedImage("12");

    expect(fetcher).toHaveBeenNthCalledWith(
      1,
      "/api/articles/12/media/8",
      expect.objectContaining({ method: "DELETE" }),
    );
    expect(fetcher).toHaveBeenNthCalledWith(
      2,
      "/api/articles/12/featured-image",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("preserves network and abort semantics", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await expect(listArticles({ page: 1, per_page: 20 })).rejects.toMatchObject(
      {
        status: 503,
      },
    );
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new DOMException("aborted", "AbortError")),
    );
    await expect(listArticles({ page: 1, per_page: 20 })).rejects.toMatchObject(
      {
        name: "AbortError",
      },
    );
  });
});
