import { describe, expect, it, vi } from "vitest";

import {
  createBffLogoutHandler,
  navigateToLogin,
  submitLogoutToBff,
} from "../../../../app/(protected)/_components/logout-bff.client";

describe("logout BFF presentation adapter", () => {
  it("submits to the same-origin logout BFF endpoint", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 204 }));

    await expect(submitLogoutToBff(fetcher as typeof fetch)).resolves.toBe(
      true,
    );
    expect(fetcher).toHaveBeenCalledWith("/api/auth/logout", {
      method: "POST",
      credentials: "same-origin",
    });
  });

  it("replaces navigation only after confirmed logout", async () => {
    const navigate = vi.fn();
    const logout = createBffLogoutHandler(
      navigate,
      vi
        .fn()
        .mockResolvedValue(new Response(null, { status: 204 })) as typeof fetch,
    );

    await logout();
    expect(navigate).toHaveBeenCalledOnce();
  });

  it("navigates even when the backend logout request fails because the local cookie is cleared", async () => {
    const navigate = vi.fn();
    const logout = createBffLogoutHandler(
      navigate,
      vi
        .fn()
        .mockResolvedValue(new Response(null, { status: 500 })) as typeof fetch,
    );

    await logout();
    expect(navigate).toHaveBeenCalledOnce();
  });

  it("uses replace-style login navigation", () => {
    const replace = vi.fn();

    navigateToLogin({ replace });

    expect(replace).toHaveBeenCalledOnce();
    expect(replace).toHaveBeenCalledWith("/login");
  });
});
