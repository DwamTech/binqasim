import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getContact,
  getSystemContent,
  settingsErrorMessage,
  SettingsClientError,
  updateSiteStatus,
  updateSupport,
} from "./settings.client";

afterEach(() => vi.unstubAllGlobals());

const response = (body: unknown, status = 200) =>
  Response.json(body, { status });

describe("settings browser adapter", () => {
  it("uses same-origin BFF routes and never sends a token", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      response({
        success: true,
        data: {
          id: "1",
          social: {},
          phones: {},
          business_details: {},
        },
      }),
    );
    vi.stubGlobal("fetch", fetcher);
    await getContact();
    const [url, options] = fetcher.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/settings/contact");
    expect(options.credentials).toBe("same-origin");
    expect(options.headers).not.toHaveProperty("authorization");
  });

  it("forwards typed mutation methods and payloads", async () => {
    const fetcher = vi.fn().mockImplementation(() =>
      Promise.resolve(
        response({
          success: true,
          data: { message: "ok", status: "closed" },
        }),
      ),
    );
    vi.stubGlobal("fetch", fetcher);
    await updateSupport("module_articles_enabled", false);
    await updateSiteStatus("closed");
    expect(fetcher.mock.calls[0]?.[1]).toMatchObject({ method: "POST" });
    expect(JSON.parse(String(fetcher.mock.calls[0]?.[1]?.body))).toEqual({
      key: "module_articles_enabled",
      value: false,
    });
    expect(JSON.parse(String(fetcher.mock.calls[1]?.[1]?.body))).toEqual({
      status: "closed",
    });
  });

  it("encodes only compile-time approved content keys", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      response({
        success: true,
        data: { key: "masaref_alre3", content: "content" },
      }),
    );
    vi.stubGlobal("fetch", fetcher);
    await getSystemContent("masaref_alre3");
    expect(fetcher.mock.calls[0]?.[0]).toBe(
      "/api/settings/content/masaref_alre3",
    );
  });

  it("normalizes feature failures and keeps 403 distinct from session expiry", async () => {
    expect(settingsErrorMessage(401)).toContain("الجلسة");
    expect(settingsErrorMessage(403)).toContain("صلاحية");
    expect(settingsErrorMessage(404)).toContain("غير موجود");
    expect(settingsErrorMessage(422)).toContain("القيم");
    expect(settingsErrorMessage(500)).toContain("غير متاحة");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        response(
          {
            success: false,
            error: { fieldErrors: { email: ["invalid"] } },
          },
          422,
        ),
      ),
    );
    await expect(updateSiteStatus("open")).rejects.toMatchObject({
      status: 422,
      fieldErrors: { email: ["invalid"] },
    } satisfies Partial<SettingsClientError>);
  });

  it("maps a network failure to a safe service error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("secret host")));
    await expect(getContact()).rejects.toMatchObject({
      status: 503,
      message: settingsErrorMessage(503),
    });
  });
});
