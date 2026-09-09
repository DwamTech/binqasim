import { afterEach, describe, expect, it, vi } from "vitest";

import {
  deleteSection,
  listSections,
  sectionErrorMessage,
  SectionsClientError,
  updateSection,
} from "./sections.client";

afterEach(() => vi.unstubAllGlobals());

function response(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}

describe("sections browser adapter", () => {
  it("keeps list filters and pagination in the same-origin BFF URL", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      response({
        success: true,
        data: {
          current_page: 2,
          data: [],
          last_page: 2,
          per_page: 20,
          total: 21,
        },
      }),
    );
    vi.stubGlobal("fetch", fetcher);

    await listSections({ search: "news", module: "articles", page: 2 });
    expect(fetcher).toHaveBeenCalledWith(
      "/api/sections?page=2&search=news&module=articles",
      expect.objectContaining({ credentials: "same-origin" }),
    );
  });

  it("uses DELETE through the BFF and never sends a token", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        response({ success: true, data: { message: "deleted" } }),
      );
    vi.stubGlobal("fetch", fetcher);

    await deleteSection("12");
    const [, options] = fetcher.mock.calls[0] as [string, RequestInit];
    expect(options.method).toBe("DELETE");
    expect(options.headers).not.toHaveProperty("authorization");
  });

  it("submits is_active true when reactivating and keeps authorization server-side", async () => {
    const inactiveSection = {
      id: "12",
      name: "Inactive",
      slug: "inactive",
      module: "articles",
      description: null,
      is_active: true,
    };
    const fetcher = vi.fn().mockResolvedValue(
      response({
        success: true,
        data: { message: "updated", section: inactiveSection },
      }),
    );
    vi.stubGlobal("fetch", fetcher);

    await updateSection("12", {
      name: "Inactive",
      module: "articles",
      description: null,
      is_active: true,
    });
    const [url, options] = fetcher.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/sections/12");
    expect(options.method).toBe("PATCH");
    expect(JSON.parse(String(options.body))).toMatchObject({ is_active: true });
    expect(options.headers).not.toHaveProperty("authorization");
  });

  it("maps 409, 403, 404, validation, network, and server failures safely", async () => {
    expect(sectionErrorMessage(409)).toContain("مرتبط بمحتوى");
    expect(sectionErrorMessage(403)).toContain("صلاحية");
    expect(sectionErrorMessage(404)).toContain("غير موجود");
    expect(sectionErrorMessage(422)).toContain("البيانات");
    expect(sectionErrorMessage(500)).toContain("غير متاحة");

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        response(
          {
            success: false,
            error: { fieldErrors: { name: ["duplicate"] } },
          },
          422,
        ),
      ),
    );
    await expect(deleteSection("1")).rejects.toMatchObject({
      status: 422,
      fieldErrors: { name: ["duplicate"] },
    } satisfies Partial<SectionsClientError>);
  });

  it("maps an offline backend to a retryable generic service message", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await expect(listSections({ page: 1 })).rejects.toMatchObject({
      status: 503,
      message: sectionErrorMessage(503),
    });
  });
});
