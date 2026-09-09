import { beforeEach, describe, expect, it, vi } from "vitest";

const moduleGuard = vi.hoisted(() => vi.fn());

vi.mock("server-only", () => ({}));
vi.mock("@/server/dal/dashboard-module-guards", () => ({
  isDashboardModuleEnabled: moduleGuard,
}));

import { pagesModuleDisabledResponse } from "./pages-module-guard";

describe("Pages BFF module guard", () => {
  beforeEach(() => moduleGuard.mockReset());

  it("fails closed with the established no-store 404 when Pages is disabled", async () => {
    moduleGuard.mockReturnValue(false);

    const response = pagesModuleDisabledResponse();

    expect(moduleGuard).toHaveBeenCalledWith("pages");
    expect(response?.status).toBe(404);
    expect(response?.headers.get("cache-control")).toBe("no-store");
    await expect(response?.json()).resolves.toEqual({
      success: false,
      error: { code: "AUTH_FORBIDDEN", message: "Module is disabled." },
    });
  });

  it("preserves the existing BFF flow when Pages is enabled", () => {
    moduleGuard.mockReturnValue(true);

    expect(pagesModuleDisabledResponse()).toBeNull();
    expect(moduleGuard).toHaveBeenCalledWith("pages");
  });
});
