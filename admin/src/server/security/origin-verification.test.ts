import { describe, expect, it } from "vitest";

import { verifyRequestOrigin } from "./origin-verification";

describe("verifyRequestOrigin", () => {
  const options = { requestOrigin: "https://dashboard.example.com" };

  it("accepts the same origin", () => {
    expect(
      verifyRequestOrigin("https://dashboard.example.com", options),
    ).toEqual({
      ok: true,
    });
  });

  it("accepts an explicitly trusted origin", () => {
    expect(
      verifyRequestOrigin("https://trusted.example.com", {
        ...options,
        trustedOrigins: ["https://trusted.example.com"],
      }),
    ).toEqual({ ok: true });
  });

  it("rejects an external origin", () => {
    expect(verifyRequestOrigin("https://evil.example.com", options)).toEqual({
      ok: false,
      reason: "invalid_origin",
    });
  });

  it("rejects a missing origin", () => {
    expect(verifyRequestOrigin(null, options)).toEqual({
      ok: false,
      reason: "missing_origin",
    });
  });

  it.each([
    "http://dashboard.example.com",
    "https://dashboard.example.com:444",
    "https://user:pass@dashboard.example.com",
    "//dashboard.example.com",
    "not a url",
    "null",
  ])("rejects a mismatched or malformed origin %s", (origin) => {
    expect(verifyRequestOrigin(origin, options).ok).toBe(false);
  });

  it("normalizes the default HTTPS port", () => {
    expect(
      verifyRequestOrigin("https://dashboard.example.com:443", options),
    ).toEqual({ ok: true });
  });
});
