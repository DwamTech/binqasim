import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { createServerApiClient } from "@/core/api/server-api-client.core";
import { LibraryIndexesRepository } from "./library-indexes.repository";

const item = {
  id: 9,
  type: "guest",
  name: "ضيف",
  title: "باحث",
  visit_date: "2026-08-09",
  status: "pending",
  image_url: null,
  reviewed_at: null,
  reviewer: null,
  rejection_reason: null,
  created_at: "2026-08-09T10:00:00Z",
};

function subject(payload: unknown, status = 200) {
  const fetch = vi
    .fn()
    .mockResolvedValue(new Response(JSON.stringify(payload), { status }));
  const client = createServerApiClient({
    baseUrl: () => "https://api.example.test/api",
    fetch: fetch as unknown as typeof globalThis.fetch,
    normalizeApiBase: true,
  });
  return { fetch, repository: new LibraryIndexesRepository(client) };
}

describe("LibraryIndexesRepository", () => {
  it("reads the unified inbox with allowlisted filters and a server-only bearer", async () => {
    const { fetch, repository } = subject({
      data: [item],
      links: {},
      meta: {
        current_page: 2,
        last_page: 3,
        per_page: 20,
        total: 41,
      },
      filter_options: {
        types: [
          { value: "golden_visit", label: "السجل الذهبي" },
          { value: "guest", label: "سجل الضيوف" },
        ],
        statuses: ["pending", "approved", "rejected"],
      },
      stats: {
        total: 41,
        pending: 20,
        approved: 15,
        rejected: 6,
        by_type: {
          golden_visit: {
            total: 20,
            pending: 10,
            approved: 8,
            rejected: 2,
          },
          guest: { total: 21, pending: 10, approved: 7, rejected: 4 },
        },
      },
    });
    const result = await repository.list(
      {
        type: "guest",
        status: "pending",
        search: "ضيف",
        page: 2,
        per_page: 20,
      },
      "private-token",
    );
    expect(result.success).toBe(true);
    const [url, options] = fetch.mock.calls[0] as [URL, RequestInit];
    expect(url.pathname).toBe("/api/admin/library-indexes/submissions");
    expect(url.searchParams.get("type")).toBe("guest");
    expect(url.searchParams.get("status")).toBe("pending");
    expect(options.cache).toBe("no-store");
    expect(new Headers(options.headers).get("authorization")).toBe(
      "Bearer private-token",
    );
  });

  it("uses the type and id in the exact detail endpoint", async () => {
    const { fetch, repository } = subject({ data: item });
    await repository.detail("guest", "9", "private-token");
    const [url] = fetch.mock.calls[0] as [URL, RequestInit];
    expect(url.pathname).toBe("/api/admin/library-indexes/submissions/guest/9");
  });

  it.each([401, 403, 404, 500])(
    "preserves backend failure status %i",
    async (status) => {
      const { repository } = subject({}, status);
      await expect(
        repository.detail("golden_visit", "9", "private-token"),
      ).resolves.toMatchObject({ success: false, error: { status } });
    },
  );

  it("rejects malformed backend payloads at the runtime boundary", async () => {
    const { repository } = subject({ data: { malformed: true } });
    await expect(
      repository.detail("guest", "9", "private-token"),
    ).resolves.toMatchObject({
      success: false,
      error: { code: "INVALID_BACKEND_RESPONSE" },
    });
  });
});
