import { beforeEach, describe, expect, it, vi } from "vitest";

const testEnvironment = vi.hoisted(() => ({
  PUBLIC_FRONTEND_ORIGIN: "https://public.example.com",
}));

vi.mock("server-only", () => ({}));
vi.mock("@/core/env/server", () => ({ serverEnv: testEnvironment }));

import { buildPreviewUrl, buildPublicPageUrl } from "./pages-public-url.server";

describe("Pages trusted public URL builder", () => {
  beforeEach(() => {
    testEnvironment.PUBLIC_FRONTEND_ORIGIN = "https://public.example.com";
  });

  it.each([
    ["about", "https://public.example.com/pages/about"],
    ["company/team", "https://public.example.com/pages/company/team"],
    [
      "company-profile/team-2026",
      "https://public.example.com/pages/company-profile/team-2026",
    ],
  ])("builds the canonical public Page URL for %s", (path, expected) => {
    expect(buildPublicPageUrl(path)).toBe(expected);
  });

  it.each([
    "",
    "/about",
    "about/",
    "company//team",
    ".",
    "..",
    "company/../team",
    "company/%2e%2e/team",
    "https://attacker.example/page",
    "//attacker.example/page",
    "https:attacker",
    "Company/team",
    "company_team",
    "company team",
  ])("rejects malformed or origin-changing Page path %s", (path) => {
    expect(() => buildPublicPageUrl(path)).toThrow(
      "Invalid canonical Page path",
    );
  });

  it("cannot change the configured host, protocol, or port", () => {
    testEnvironment.PUBLIC_FRONTEND_ORIGIN = "http://public.example.com:8080";

    const url = new URL(buildPublicPageUrl("company/team"));

    expect(url.protocol).toBe("http:");
    expect(url.hostname).toBe("public.example.com");
    expect(url.port).toBe("8080");
  });

  it("builds Preview URLs only from valid lowercase hexadecimal tokens", () => {
    const token = "a".repeat(64);

    expect(buildPreviewUrl(token)).toBe(
      `https://public.example.com/pages-preview/${token}`,
    );
    for (const invalid of [
      "a".repeat(63),
      "A".repeat(64),
      `${"a".repeat(64)}/attacker`,
      "https://attacker.example",
    ]) {
      expect(() => buildPreviewUrl(invalid)).toThrow(
        "Invalid Page Preview token",
      );
    }
  });

  it("fails closed when the trusted server origin is unavailable", () => {
    testEnvironment.PUBLIC_FRONTEND_ORIGIN = undefined as unknown as string;

    expect(() => buildPublicPageUrl("about")).toThrow("PUBLIC_FRONTEND_ORIGIN");
  });
});
