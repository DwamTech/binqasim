import { describe, expect, it } from "vitest";

import {
  createContentSecurityPolicy,
  createNextSecurityHeaders,
  createSecurityHeaders,
} from "./security-headers";

describe("createSecurityHeaders", () => {
  it("includes the required safe headers", () => {
    expect(createSecurityHeaders()).toMatchObject({
      "permissions-policy":
        "camera=(), geolocation=(), microphone=(), payment=(), usb=()",
      "referrer-policy": "strict-origin-when-cross-origin",
      "x-content-type-options": "nosniff",
      "x-frame-options": "DENY",
    });
  });

  it("supports Next.js, inline styles, and HMR in development without wildcards", () => {
    const policy = createContentSecurityPolicy("development");

    expect(policy).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval'");
    expect(policy).toContain("style-src 'self' 'unsafe-inline'");
    expect(policy).toContain("connect-src 'self' ws: wss:");
    expect(policy).not.toMatch(/(?:^|\\s)\\*(?:\\s|;|$)/);
  });

  it("keeps production framework-compatible without unsafe-eval", () => {
    const policy = createContentSecurityPolicy("production");

    expect(policy).toContain("script-src 'self' 'unsafe-inline'");
    expect(policy).not.toContain("'unsafe-eval'");
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("base-uri 'self'");
    expect(policy).toContain("form-action 'self'");
    expect(policy).toContain("frame-ancestors 'none'");
  });

  it("generates exactly one CSP header and production-only HSTS", () => {
    const development = createNextSecurityHeaders("development");
    const production = createNextSecurityHeaders("production");

    expect(
      development.filter(({ key }) => key === "Content-Security-Policy"),
    ).toHaveLength(1);
    expect(
      production.filter(({ key }) => key === "Content-Security-Policy"),
    ).toHaveLength(1);
    expect(
      development.some(({ key }) => key === "Strict-Transport-Security"),
    ).toBe(false);
    expect(
      production.some(({ key }) => key === "Strict-Transport-Security"),
    ).toBe(true);
  });

  it("allows a future caller to supply its CSP", () => {
    expect(
      createSecurityHeaders({ contentSecurityPolicy: "default-src 'self'" })[
        "content-security-policy"
      ],
    ).toBe("default-src 'self'");
  });

  it("allows only a validated backend media origin for images and videos", () => {
    const policy = createContentSecurityPolicy(
      "development",
      "https://cms.example.test/api",
    );
    expect(policy).toContain(
      "img-src 'self' blob: data: https://cms.example.test",
    );
    expect(policy).toContain(
      "media-src 'self' blob: data: https://cms.example.test",
    );
    expect(
      createContentSecurityPolicy("development", "javascript:alert(1)"),
    ).not.toContain("javascript:");
  });
});
