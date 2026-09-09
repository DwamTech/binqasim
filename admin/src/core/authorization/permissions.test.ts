import { describe, expect, it } from "vitest";

import { hasPermission } from "./permissions";

describe("hasPermission", () => {
  it("returns true for an owned permission", () => {
    expect(hasPermission(["dashboard.view"], "dashboard.view")).toBe(true);
  });

  it("returns false for a missing permission", () => {
    expect(hasPermission(["dashboard.view"], "settings.update")).toBe(false);
  });
});
