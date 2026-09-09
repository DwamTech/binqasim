import { z } from "zod";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createServerApiClient } from "./server-api-client.core";

describe("createServerApiClient", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("sends locale headers and validates successful JSON responses", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      new Response(JSON.stringify({ id: "admin-1" }), {
        headers: {
          "content-type": "application/json",
          "x-request-id": "request-1",
        },
      }),
    );
    const client = createServerApiClient({
      baseUrl: () => "https://api.example.com",
      defaultLocale: "en",
      fetch,
    });

    await expect(
      client.request("/admins", {
        method: "POST",
        body: { name: "Admin" },
        locale: "ar",
        responseSchema: z.object({ id: z.string() }),
      }),
    ).resolves.toEqual({
      success: true,
      data: { id: "admin-1" },
      meta: { requestId: "request-1" },
    });

    const requestInit = fetch.mock.calls[0]?.[1];
    expect(requestInit?.headers).toBeInstanceOf(Headers);
    expect(new Headers(requestInit?.headers).get("accept-language")).toBe("ar");
  });

  it("returns an invalid-response failure when schema validation fails", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      new Response(JSON.stringify({ id: 1 }), {
        headers: { "content-type": "application/json" },
      }),
    );
    const client = createServerApiClient({
      baseUrl: () => "https://api.example.com",
      fetch,
    });

    await expect(
      client.request("/admins", {
        responseSchema: z.object({ id: z.string() }),
      }),
    ).resolves.toMatchObject({
      success: false,
      error: {
        code: "INVALID_BACKEND_RESPONSE",
        message:
          "استجابة الخادم لا تطابق بيانات العملية المتوقعة. راجع الحقول الموضحة.",
        fieldErrors: {
          id: [expect.stringContaining("expected string")],
        },
        method: "GET",
        endpoint: "/admins",
        category: "client",
        retryable: false,
        authenticationInvalid: false,
      },
    });
  });

  it("returns a timeout failure when the request exceeds its timeout", async () => {
    vi.useFakeTimers();
    const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(
      (_input, init) =>
        new Promise<Response>((_resolve, reject) => {
          const signal = init?.signal;
          signal?.addEventListener("abort", () => reject(new Error("Aborted")));
        }),
    );
    const client = createServerApiClient({
      baseUrl: () => "https://api.example.com",
      fetch,
    });

    const response = client.request("/admins", { timeoutMs: 100 });

    await vi.advanceTimersByTimeAsync(100);

    await expect(response).resolves.toEqual({
      success: false,
      error: {
        code: "REQUEST_TIMEOUT",
        message: "The API request timed out.",
        method: "GET",
        endpoint: "/admins",
        category: "timeout",
        retryable: true,
        authenticationInvalid: false,
      },
    });
  });

  it("returns an aborted failure when the caller cancels the request", async () => {
    const controller = new AbortController();
    const fetch = vi.fn<typeof globalThis.fetch>().mockImplementation(
      (_input, init) =>
        new Promise<Response>((_resolve, reject) => {
          const signal = init?.signal;
          signal?.addEventListener("abort", () => reject(new Error("Aborted")));
        }),
    );
    const client = createServerApiClient({
      baseUrl: () => "https://api.example.com",
      fetch,
    });

    const response = client.request("/admins", { signal: controller.signal });
    controller.abort();

    await expect(response).resolves.toEqual({
      success: false,
      error: {
        code: "REQUEST_ABORTED",
        message: "The API request was cancelled.",
        method: "GET",
        endpoint: "/admins",
        category: "aborted",
        retryable: false,
        authenticationInvalid: false,
      },
    });
  });

  it("returns a mapped failure for unsuccessful responses", async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(new Response(null, { status: 401 }));
    const client = createServerApiClient({
      baseUrl: () => "https://api.example.com",
      fetch,
    });

    await expect(client.request("/admins")).resolves.toEqual({
      success: false,
      error: {
        code: "AUTH_SESSION_EXPIRED",
        message: "The session has expired.",
        status: 401,
        method: "GET",
        endpoint: "/admins",
        category: "authorization",
        retryable: false,
        authenticationInvalid: true,
      },
    });
  });

  it("rejects paths that could target another host", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>();
    const client = createServerApiClient({
      baseUrl: () => "https://api.example.com",
      fetch,
    });

    await expect(client.request("//other.example.com")).resolves.toEqual({
      success: false,
      error: {
        code: "UNKNOWN_ERROR",
        message: "The API request could not be completed.",
      },
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("keeps multipart bodies intact and uses Laravel method overrides", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        headers: { "content-type": "application/json" },
      }),
    );
    const client = createServerApiClient({
      baseUrl: () => "https://api.example.com",
      fetch,
    });
    const form = new FormData();
    form.append("files[]", new Blob(["content"]), "file.txt");

    await client.request("/articles/1", {
      method: "PUT",
      body: form,
      multipartMethodOverride: "PUT",
    });

    const init = fetch.mock.calls[0]?.[1];
    expect(init?.method).toBe("POST");
    expect(init?.body).toBeInstanceOf(FormData);
    expect(new Headers(init?.headers).has("content-type")).toBe(false);
    expect((init?.body as FormData).get("_method")).toBe("PUT");
    expect(form.get("_method")).toBeNull();
  });

  it("forwards upload streams without buffering or JSON serialization", async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(Response.json({ ok: true }));
    const client = createServerApiClient({
      baseUrl: () => "https://api.example.com",
      fetch,
    });
    const stream = new ReadableStream<Uint8Array>();

    await client.request("/articles", {
      method: "POST",
      headers: {
        "content-type": "multipart/form-data; boundary=test",
        "content-length": "42",
      },
      bodyStream: stream,
    });

    const init = fetch.mock.calls[0]?.[1] as RequestInit & {
      duplex?: "half";
    };
    expect(init.body).toBe(stream);
    expect(init.duplex).toBe("half");
    expect(new Headers(init.headers).get("content-length")).toBe("42");
  });

  it("does not send a body with HEAD and safely rejects circular JSON", async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValue(new Response(null, { status: 204 }));
    const client = createServerApiClient({
      baseUrl: () => "https://api.example.com",
      fetch,
    });
    await client.request("/health", {
      method: "HEAD",
      body: { ignored: true },
    });
    expect(fetch.mock.calls[0]?.[1]?.body).toBeUndefined();

    const circular: { self?: unknown } = {};
    circular.self = circular;
    await expect(
      client.request("/articles", { method: "POST", body: circular }),
    ).resolves.toMatchObject({
      success: false,
      error: { code: "REQUEST_BODY_INVALID" },
    });
  });

  it("preserves Laravel validation fields and backend messages", async () => {
    const fetch = vi.fn<typeof globalThis.fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          message: "The given data was invalid.",
          errors: { title: ["Required."] },
        }),
        { status: 422, headers: { "content-type": "application/json" } },
      ),
    );
    const client = createServerApiClient({
      baseUrl: () => "https://api.example.com",
      fetch,
    });

    await expect(
      client.request("/articles", { method: "POST", body: {} }),
    ).resolves.toMatchObject({
      success: false,
      error: {
        status: 422,
        message: "The given data was invalid.",
        fieldErrors: { title: ["Required."] },
        category: "validation",
      },
    });
  });

  it("preserves arrays, paginator objects, wrappers, and empty responses", async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValueOnce(Response.json([{ id: 1, name: "Section" }]))
      .mockResolvedValueOnce(
        Response.json({ current_page: 1, data: [], per_page: 15, total: 0 }),
      )
      .mockResolvedValueOnce(Response.json({ admin: { id: "1" } }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    const client = createServerApiClient({
      baseUrl: () => "https://api.example.com",
      fetch,
    });

    await expect(client.request("/sections")).resolves.toMatchObject({
      success: true,
      data: [{ id: 1, name: "Section" }],
    });
    await expect(client.request("/articles")).resolves.toMatchObject({
      success: true,
      data: { current_page: 1, data: [], per_page: 15, total: 0 },
    });
    await expect(client.request("/admin/me")).resolves.toMatchObject({
      success: true,
      data: { admin: { id: "1" } },
    });
    await expect(
      client.request("/logout", { method: "POST" }),
    ).resolves.toMatchObject({
      success: true,
      data: undefined,
    });
  });

  it("handles JSON without a content type and non-JSON error bodies deterministically", async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValueOnce(new Response('{"id":1}'))
      .mockResolvedValueOnce(
        new Response("<h1>Unavailable</h1>", { status: 503 }),
      );
    const client = createServerApiClient({
      baseUrl: () => "https://api.example.com",
      fetch,
    });

    await expect(client.request("/series")).resolves.toMatchObject({
      success: true,
      data: { id: 1 },
    });
    await expect(client.request("/series")).resolves.toMatchObject({
      success: false,
      error: { status: 503, category: "server", retryable: true },
    });
  });
});
