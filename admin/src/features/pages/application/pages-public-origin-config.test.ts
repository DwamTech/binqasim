import { describe, expect, it } from "vitest";

import { validateServerEnvironment } from "@/core/env/server.schema";

describe("Pages public frontend origin configuration", () => {
  it.each([
    ["http://public.example.com", "http://public.example.com"],
    ["https://public.example.com", "https://public.example.com"],
    ["https://public.example.com:8443", "https://public.example.com:8443"],
    ["https://public.example.com/", "https://public.example.com"],
  ])("accepts and normalizes %s", (value, expected) => {
    expect(
      validateServerEnvironment({
        DASHBOARD_MODULE_PAGES_ENABLED: "true",
        PUBLIC_FRONTEND_ORIGIN: value,
      }).PUBLIC_FRONTEND_ORIGIN,
    ).toBe(expected);
  });

  it.each([
    "javascript:alert(1)",
    "data:text/plain,unsafe",
    "ftp://public.example.com",
    "not a URL",
    "https://user:password@public.example.com",
    "https://public.example.com/site",
    "https://public.example.com?site=pages",
    "https://public.example.com#pages",
  ])("rejects unsafe or malformed origin %s", (value) => {
    expect(() =>
      validateServerEnvironment({
        DASHBOARD_MODULE_PAGES_ENABLED: "true",
        PUBLIC_FRONTEND_ORIGIN: value,
      }),
    ).toThrow("PUBLIC_FRONTEND_ORIGIN");
  });

  it("allows a missing origin only while Pages is disabled", () => {
    expect(
      validateServerEnvironment({
        DASHBOARD_MODULE_PAGES_ENABLED: "false",
      }).PUBLIC_FRONTEND_ORIGIN,
    ).toBeUndefined();

    expect(() =>
      validateServerEnvironment({
        DASHBOARD_MODULE_PAGES_ENABLED: "true",
      }),
    ).toThrow("PUBLIC_FRONTEND_ORIGIN");
  });
});
