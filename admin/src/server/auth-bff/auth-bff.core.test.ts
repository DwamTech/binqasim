import { describe, expect, it, vi } from "vitest";

import {
  handleLogin,
  handleLogout,
  handleSession,
  isNativeLoginFormRequest,
  toLoginHttpResponse,
  toHttpResponse,
} from "./auth-bff.core";

const admin = {
  id: "1",
  name: "Admin",
  email: "admin@example.com",
  role: "admin" as const,
};
const dependencies = (overrides = {}) => ({
  isProduction: true,
  authRepository: {
    login: vi.fn().mockResolvedValue({ admin, token: "sanctum-secret" }),
    getCurrentAdmin: vi.fn().mockResolvedValue(admin),
    logout: vi.fn().mockResolvedValue(undefined),
  },
  ...overrides,
});

describe("Sanctum auth BFF", () => {
  it("sets an HttpOnly token cookie but never serializes the token", async () => {
    const result = await handleLogin(
      new Request("https://cms.test/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ identity: "a", password: "secret" }),
      }),
      dependencies(),
      { rateLimitKey: "test" },
    );
    const response = toHttpResponse(result, true);
    expect(await response.text()).not.toContain("sanctum-secret");
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    expect(response.headers.get("set-cookie")).toContain("Secure");
  });

  it("clears only authoritative invalid tokens", async () => {
    const invalid = dependencies({
      authRepository: {
        login: vi.fn(),
        logout: vi.fn(),
        getCurrentAdmin: vi
          .fn()
          .mockRejectedValue({ code: "AUTH_SESSION_EXPIRED", status: 401 }),
      },
    });
    const result = await handleSession(invalid, {
      rateLimitKey: "test",
      token: "secret",
    });
    expect(result.cookie).toEqual({ action: "clear" });
    const unavailable = dependencies({
      authRepository: {
        login: vi.fn(),
        logout: vi.fn(),
        getCurrentAdmin: vi
          .fn()
          .mockRejectedValue({ code: "NETWORK_UNAVAILABLE" }),
      },
    });
    await expect(
      handleSession(unavailable, { rateLimitKey: "test", token: "secret" }),
    ).resolves.not.toHaveProperty("cookie");
  });

  it("forwards logout server-side and always clears the local cookie", async () => {
    const d = dependencies();
    const result = await handleLogout(d, {
      rateLimitKey: "test",
      token: "secret",
    });
    expect(d.authRepository.logout).toHaveBeenCalledWith("secret");
    expect(result.cookie).toEqual({ action: "clear" });
  });

  it("does not contact Laravel or set a cookie for malformed login input", async () => {
    const d = dependencies();
    const result = await handleLogin(
      new Request("https://cms.test/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ identity: "", password: 12 }),
      }),
      d,
      { rateLimitKey: "test" },
    );
    expect(result.status).toBe(400);
    expect(d.authRepository.login).not.toHaveBeenCalled();
    expect(result.cookie).toBeUndefined();
  });

  it.each([
    [401, "AUTH_SESSION_EXPIRED", 401],
    [403, "AUTH_FORBIDDEN", 403],
    [422, "VALIDATION_FAILED", 422],
    [429, "RATE_LIMIT_EXCEEDED", 429],
    [503, "BACKEND_UNAVAILABLE", 503],
  ] as const)(
    "does not set a cookie for Laravel login failure %i",
    async (status, code, expected) => {
      const d = dependencies({
        authRepository: {
          login: vi.fn().mockRejectedValue({ status, code }),
          getCurrentAdmin: vi.fn(),
          logout: vi.fn(),
        },
      });
      const result = await handleLogin(
        new Request("https://cms.test", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ identity: "admin", password: "secret" }),
        }),
        d,
        { rateLimitKey: "test" },
      );
      expect(result.status).toBe(expected);
      expect(result.cookie).toBeUndefined();
    },
  );

  it("makes missing cookies unauthenticated without a Laravel call and is non-cacheable", async () => {
    const d = dependencies();
    const result = await handleSession(d, { rateLimitKey: "test" });
    const response = toHttpResponse(result, true);
    expect(result.status).toBe(401);
    expect(d.authRepository.getCurrentAdmin).not.toHaveBeenCalled();
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("returns only a safe admin from a valid server-side session check", async () => {
    const d = dependencies();
    const result = await handleSession(d, {
      rateLimitKey: "test",
      token: "server-only-token",
    });
    const response = toHttpResponse(result, true);
    expect(d.authRepository.getCurrentAdmin).toHaveBeenCalledWith(
      "server-only-token",
    );
    expect(await response.text()).not.toContain("server-only-token");
    expect(result.cookie).toBeUndefined();
  });

  it("is idempotent for a missing logout cookie and clears on remote failure", async () => {
    const missing = await handleLogout(dependencies(), {
      rateLimitKey: "test",
    });
    expect(missing).toMatchObject({ status: 204, cookie: { action: "clear" } });
    const failed = await handleLogout(
      dependencies({
        authRepository: {
          login: vi.fn(),
          getCurrentAdmin: vi.fn(),
          logout: vi.fn().mockRejectedValue(new Error("offline")),
        },
      }),
      { rateLimitKey: "test", token: "secret" },
    );
    expect(failed).toMatchObject({ status: 204, cookie: { action: "clear" } });
  });

  it("accepts the native POST fallback and redirects without credentials in the URL", async () => {
    const d = dependencies();
    const request = new Request("https://cms.test/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        identity: "admin@example.com",
        password: "private-password",
      }),
    });

    const result = await handleLogin(request.clone(), d, {
      rateLimitKey: "test",
    });
    const response = toLoginHttpResponse(
      result,
      true,
      isNativeLoginFormRequest(request),
    );

    expect(d.authRepository.login).toHaveBeenCalledWith({
      identity: "admin@example.com",
      password: "private-password",
    });
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/dashboard");
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.text()).toBe("");
    expect(request.url).not.toContain("admin@example.com");
    expect(request.url).not.toContain("private-password");
  });
});
