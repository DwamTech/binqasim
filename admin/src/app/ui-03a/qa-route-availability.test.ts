import { describe, expect, it } from "vitest";

import { isUi03aQaRouteAvailable } from "./qa-route-availability";

describe("UI-03A QA route availability", () => {
  it("is available only during development", () => {
    expect(isUi03aQaRouteAvailable("development")).toBe(true);
    expect(isUi03aQaRouteAvailable("production")).toBe(false);
    expect(isUi03aQaRouteAvailable("test")).toBe(false);
    expect(isUi03aQaRouteAvailable(undefined)).toBe(false);
  });
});
