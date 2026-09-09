import { describe, expect, it } from "vitest";

import { getRoutePolicyDecision, isStaticAsset } from "./route-policy";

describe("route policy", () => {
  it("redirects a guest from a protected route to login", () => {
    expect(getRoutePolicyDecision("/dashboard", false)).toEqual({
      action: "redirect",
      destination: "/login",
    });
  });

  it("redirects an authenticated admin from login to dashboard", () => {
    expect(getRoutePolicyDecision("/login", true)).toEqual({
      action: "redirect",
      destination: "/dashboard",
    });
  });

  it("ignores static assets", () => {
    expect(isStaticAsset("/_next/static/app.js")).toBe(true);
    expect(getRoutePolicyDecision("/_next/static/app.js", false)).toEqual({
      action: "next",
    });
  });

  it("does not redirect an already-safe route", () => {
    expect(getRoutePolicyDecision("/login", false)).toEqual({
      action: "next",
    });
  });
});
