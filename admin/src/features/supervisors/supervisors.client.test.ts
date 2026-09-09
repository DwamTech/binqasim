import { afterEach, describe, expect, it, vi } from "vitest";

import {
  changeSupervisorPassword,
  listSupervisors,
  supervisorsErrorMessage,
  setSupervisorActive,
} from "./supervisors.client";

afterEach(() => vi.unstubAllGlobals());

const response = (body: unknown, status = 200) =>
  Response.json(body, { status });

describe("supervisors browser adapter", () => {
  it("uses same-origin URLs with server-side search filters and no token", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      response({
        success: true,
        data: {
          current_page: 1,
          data: [],
          last_page: 1,
          per_page: 20,
          total: 0,
        },
      }),
    );
    vi.stubGlobal("fetch", fetcher);
    await listSupervisors({
      search: "editor",
      role: "editor",
      is_active: "false",
      permission: "books.manage",
      page: 1,
    });
    const [url, options] = fetcher.mock.calls[0] as [string, RequestInit];
    expect(url).toContain("search=editor");
    expect(url).toContain("permission=books.manage");
    expect(options.credentials).toBe("same-origin");
    expect(options.headers).not.toHaveProperty("authorization");
  });

  it("forwards sensitive mutations without putting password in the URL", async () => {
    const fetcher = vi.fn().mockImplementation(() =>
      Promise.resolve(
        response({
          success: true,
          data: { message: "ok", user: {} },
        }),
      ),
    );
    vi.stubGlobal("fetch", fetcher);
    await setSupervisorActive("2", false);
    await changeSupervisorPassword("2", {
      password: "password123",
      password_confirmation: "password123",
    });
    expect(fetcher.mock.calls[0]?.[0]).toBe("/api/supervisors/2/deactivate");
    expect(fetcher.mock.calls[1]?.[0]).toBe("/api/supervisors/2/password");
    expect(String(fetcher.mock.calls[1]?.[0])).not.toContain("password123");
    expect(fetcher.mock.calls[1]?.[1]).toMatchObject({ method: "POST" });
  });

  it("maps authorization conflict validation rate limit and server failures", () => {
    expect(supervisorsErrorMessage(401)).toContain("الجلسة");
    expect(supervisorsErrorMessage(403)).toContain("مدير النظام");
    expect(supervisorsErrorMessage(404)).toContain("غير موجود");
    expect(supervisorsErrorMessage(409)).toContain("مدير نشط");
    expect(supervisorsErrorMessage(422)).toContain("البيانات");
    expect(supervisorsErrorMessage(429)).toContain("طلبات");
    expect(supervisorsErrorMessage(500)).toContain("غير متاحة");
  });

  it("normalizes network failure without leaking its raw message", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("private host")),
    );
    await expect(listSupervisors({ page: 1 })).rejects.toMatchObject({
      status: 503,
      message: supervisorsErrorMessage(503),
    });
  });
});
