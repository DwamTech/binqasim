import { describe, expect, it, vi } from "vitest";

import { loadServerAuthState } from "./server-auth-state.core";

const admin = {
  id: "1",
  name: "Admin",
  email: "admin@example.com",
  role: "admin" as const,
};
describe("server authentication state", () => {
  it("does not call Laravel without a cookie", async () => {
    const repository = { getCurrentAdmin: vi.fn() };
    await expect(loadServerAuthState(undefined, repository)).resolves.toEqual({
      status: "unauthenticated",
      reason: "missing",
    });
    expect(repository.getCurrentAdmin).not.toHaveBeenCalled();
  });
  it("treats a missing cookie as logged out even when auth is not configured", async () => {
    await expect(loadServerAuthState(undefined, undefined)).resolves.toEqual({
      status: "unauthenticated",
      reason: "missing",
    });
  });
  it("reports an unavailable runtime when a session needs validation", async () => {
    await expect(loadServerAuthState("token", undefined)).resolves.toEqual({
      status: "unavailable",
      reason: "runtime_unavailable",
    });
  });
  it("hydrates only the request token and does not globally cache users", async () => {
    const repository = { getCurrentAdmin: vi.fn().mockResolvedValue(admin) };
    await expect(loadServerAuthState("token-a", repository)).resolves.toEqual({
      status: "authenticated",
      admin,
    });
    await loadServerAuthState("token-b", repository);
    expect(repository.getCurrentAdmin).toHaveBeenNthCalledWith(1, "token-a");
    expect(repository.getCurrentAdmin).toHaveBeenNthCalledWith(2, "token-b");
  });
  it.each([
    [401, "AUTH_SESSION_EXPIRED", "invalid"],
    [403, "AUTH_FORBIDDEN", "forbidden"],
  ] as const)(
    "classifies authoritative %i safely",
    async (status, code, reason) => {
      await expect(
        loadServerAuthState("token", {
          getCurrentAdmin: vi.fn().mockRejectedValue({ status, code }),
        }),
      ).resolves.toEqual({ status: "unauthenticated", reason });
    },
  );
  it("keeps an outage distinct from an invalid session", async () => {
    await expect(
      loadServerAuthState("token", {
        getCurrentAdmin: vi
          .fn()
          .mockRejectedValue({ status: 503, code: "BACKEND_UNAVAILABLE" }),
      }),
    ).resolves.toEqual({ status: "unavailable", reason: "admin_unavailable" });
  });
});
