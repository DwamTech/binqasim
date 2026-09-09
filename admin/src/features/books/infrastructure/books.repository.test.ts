import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { createServerApiClient } from "@/core/api/server-api-client.core";
import { BooksRepository } from "./books.repository";

const book = { id: 1, title: "Book", type: "single" };
const detail = {
  book: {
    id: 1,
    title: "Book",
    description: "Description",
    source_type: "file",
    file_path: null,
    source_link: null,
    cover_type: "auto",
    cover_path: null,
    keywords: null,
    views_count: 1,
    rating_sum: 0,
    rating_count: 0,
    author_name: "Author",
    type: "single",
    book_series_id: null,
    section_id: null,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    average_rating: 0,
    series: null,
    section: null,
  },
  related_parts: [],
};
const routes = [
  [
    "list",
    "/admin/library/books",
    { current_page: 1, data: [book], per_page: 20, total: 1 },
  ],
  ["detail", "/admin/library/books/1", detail],
  ["series", "/admin/library/series", [{ id: 1, name: "Series" }]],
  ["seriesItem", "/admin/library/series/1", { id: 1, name: "Series" }],
  ["authors", "/admin/library/books/authors", ["Author"]],
] as const;

function repository(response: Response | Error) {
  const fetch = vi.fn().mockImplementation(() => {
    if (response instanceof Error) return Promise.reject(response);
    return Promise.resolve(response);
  });
  return {
    fetch,
    repository: new BooksRepository(
      createServerApiClient({
        baseUrl: () => "https://api.example.test/api",
        fetch: fetch as unknown as typeof globalThis.fetch,
        normalizeApiBase: true,
      }),
    ),
  };
}

async function request(
  repository: BooksRepository,
  operation: (typeof routes)[number][0],
) {
  switch (operation) {
    case "list":
      return repository.list({}, "private-token");
    case "detail":
      return repository.detail("1", "private-token");
    case "series":
      return repository.series("private-token");
    case "seriesItem":
      return repository.seriesItem("1", "private-token");
    case "authors":
      return repository.authors("private-token");
  }
}

describe("Books repository protected reads", () => {
  it.each(routes)(
    "uses %s exact admin endpoint with bearer and no-store cache",
    async (operation, path, payload) => {
      const { fetch, repository: subject } = repository(
        new Response(JSON.stringify(payload)),
      );
      const result = await request(subject, operation);
      expect(result.success).toBe(true);
      const [url, options] = fetch.mock.calls[0] as [URL, RequestInit];
      expect(url.pathname).toBe(`/api${path}`);
      expect(url.pathname).not.toContain("/api/api/");
      expect(options.method).toBe("GET");
      expect(options.cache).toBe("no-store");
      expect(new Headers(options.headers).get("authorization")).toBe(
        "Bearer private-token",
      );
    },
  );

  it.each([401, 403, 500])(
    "preserves %i failures for every protected endpoint",
    async (status) => {
      for (const [operation] of routes) {
        const { repository: subject } = repository(
          new Response("{}", { status }),
        );
        const result = await request(subject, operation);
        expect(result).toMatchObject({ success: false, error: { status } });
      }
    },
  );

  it.each(["detail", "seriesItem"] as const)(
    "preserves 404 for %s",
    async (operation) => {
      const { repository: subject } = repository(
        new Response("{}", { status: 404 }),
      );
      await expect(request(subject, operation)).resolves.toMatchObject({
        success: false,
        error: { status: 404 },
      });
    },
  );

  it.each(routes)(
    "does not convert malformed %s responses into data",
    async (operation) => {
      const { repository: subject } = repository(
        new Response(JSON.stringify({ malformed: true })),
      );
      await expect(request(subject, operation)).resolves.toMatchObject({
        success: false,
        error: { code: "INVALID_BACKEND_RESPONSE" },
      });
    },
  );

  it.each(routes)("reports network failure for %s", async (operation) => {
    const { repository: subject } = repository(new Error("offline"));
    await expect(request(subject, operation)).resolves.toMatchObject({
      success: false,
      error: { code: "NETWORK_UNAVAILABLE" },
    });
  });
});
