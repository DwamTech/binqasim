import { describe, expect, it } from "vitest";

import { safeRedirect } from "./safe-redirect";

describe("safeRedirect", () => {
  const options = { currentPath: "/login", fallback: "/dashboard" };

  it("accepts internal paths", () => {
    expect(safeRedirect("/dashboard", options)).toBe("/dashboard");
    expect(safeRedirect("/dashboard/articles?tab=overview", options)).toBe(
      "/dashboard/articles?tab=overview",
    );
  });

  it.each([
    "https://evil.com",
    "http://evil.com",
    "//evil.com",
    "/%2f%2fevil.com",
    "/%5c%5cevil.com",
    "javascript:alert(1)",
    "data:text/html,boom",
    "/\\evil.com",
  ])("rejects external target %s", (target) => {
    expect(safeRedirect(target, options)).toBe("/dashboard");
  });

  it("rejects a redirect loop to the current path", () => {
    expect(safeRedirect("/login", options)).toBe("/dashboard");
  });
});
