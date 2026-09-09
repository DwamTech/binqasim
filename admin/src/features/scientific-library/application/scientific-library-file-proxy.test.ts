import { describe, expect, it, vi } from "vitest";

import { proxyScientificLibraryFile } from "./scientific-library-file-proxy";

const request = () =>
  new Request("https://dashboard.test/api/scientific-library/items/7/file");

describe("scientific library private file proxy", () => {
  it("rejects missing auth and invalid identifiers before calling Laravel", async () => {
    const fetch = vi.fn();
    const dependencies = {
      backendApiUrl: "https://backend.test",
      fetch: fetch as unknown as typeof globalThis.fetch,
    };

    const unauthenticated = await proxyScientificLibraryFile(
      "7",
      request(),
      undefined,
      dependencies,
    );
    const invalid = await proxyScientificLibraryFile(
      "../7",
      request(),
      "token",
      dependencies,
    );

    expect(unauthenticated.status).toBe(401);
    expect(invalid.status).toBe(404);
    expect(unauthenticated.headers.get("cache-control")).toContain("no-store");
    expect(invalid.headers.get("vary")).toBe("Cookie");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("streams the protected backend file with Bearer auth and safe headers", async () => {
    const fetch = vi.fn().mockResolvedValue(
      new Response("pdf-body", {
        status: 200,
        headers: {
          "content-type": "application/pdf",
          "content-disposition": 'inline; filename="work.pdf"',
          "content-length": "8",
          "set-cookie": "backend-secret=1",
        },
      }),
    );
    const incoming = new Request(
      "https://dashboard.test/api/scientific-library/items/7/file",
      { headers: { range: "bytes=0-99" } },
    );

    const result = await proxyScientificLibraryFile(
      "7",
      incoming,
      "private-token",
      {
        backendApiUrl: "https://backend.test/base",
        fetch: fetch as unknown as typeof globalThis.fetch,
      },
    );

    const [url, init] = fetch.mock.calls[0] as [URL, RequestInit];
    const forwardedHeaders = new Headers(init.headers);
    expect(url.toString()).toBe(
      "https://backend.test/base/api/admin/scientific-library/items/7/file",
    );
    expect(forwardedHeaders.get("authorization")).toBe("Bearer private-token");
    expect(forwardedHeaders.get("range")).toBe("bytes=0-99");
    expect(init.redirect).toBe("manual");
    expect(result.status).toBe(200);
    expect(result.headers.get("content-type")).toBe("application/pdf");
    expect(result.headers.get("content-disposition")).toContain("work.pdf");
    expect(result.headers.get("cache-control")).toContain("no-store");
    expect(result.headers.get("set-cookie")).toBeNull();
    expect(await result.text()).toBe("pdf-body");
  });

  it("sanitizes backend failures and never exposes their response body", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(
        new Response("private storage trace", { status: 404 }),
      );
    const result = await proxyScientificLibraryFile("7", request(), "token", {
      backendApiUrl: "https://backend.test/api",
      fetch: fetch as unknown as typeof globalThis.fetch,
    });

    expect(result.status).toBe(404);
    expect(await result.text()).not.toContain("private storage trace");
    expect(result.headers.get("cache-control")).toContain("no-store");
  });
});
