import { describe, expect, it } from "vitest";

import { getRootRouteDestination } from "./root-route";

describe("getRootRouteDestination", () => {
  it("sends a guest to login", () => {
    expect(getRootRouteDestination({ authenticated: false })).toBe("/login");
  });

  it("sends an authenticated admin to the dashboard", () => {
    expect(getRootRouteDestination({ authenticated: true })).toBe("/dashboard");
  });
});
