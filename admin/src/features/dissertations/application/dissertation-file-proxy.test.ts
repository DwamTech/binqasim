import { describe, expect, it, vi } from "vitest";

import { proxyDissertationFile } from "./dissertation-file-proxy";

const request = () =>
  new Request("https://dashboard.test/api/dissertations/7/file", {
    headers: { Range: "bytes=0-8" },
  });

describe("proxyDissertationFile", () => {
  it("requires a session and a numeric identifier", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>();
    expect(
      (
        await proxyDissertationFile("7", request(), undefined, {
          backendApiUrl: "https://backend.test/api",
          fetch,
        })
      ).status,
    ).toBe(401);
    expect(
      (
        await proxyDissertationFile("../7", request(), "token", {
          backendApiUrl: "https://backend.test/api",
          fetch,
        })
      ).status,
    ).toBe(404);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("forwards authorization and byte ranges without caching", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      new Response("%PDF-test", {
        status: 206,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Range": "bytes 0-8/9",
        },
      }),
    );

    const response = await proxyDissertationFile("7", request(), "secret", {
      backendApiUrl: "https://backend.test/api",
      fetch,
    });

    expect(response.status).toBe(206);
    expect(response.headers.get("cache-control")).toContain("no-store");
    const [, options] = fetch.mock.calls[0]!;
    const headers = new Headers(options?.headers);
    expect(headers.get("authorization")).toBe("Bearer secret");
    expect(headers.get("range")).toBe("bytes=0-8");
  });

  it("does not expose upstream error bodies", async () => {
    const marker = "PRIVATE_BACKEND_TRACE";
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(new Response(marker, { status: 500 }));

    const response = await proxyDissertationFile("7", request(), "secret", {
      backendApiUrl: "https://backend.test/api",
      fetch,
    });

    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain(marker);
  });
});
