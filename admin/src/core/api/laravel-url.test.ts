import { describe, expect, it } from "vitest";

import { createBackendUrl, normalizeBackendApiUrl } from "./laravel-url";

describe("Laravel backend URL construction", () => {
  it("normalizes the API root and prevents duplicate api segments", () => {
    expect(normalizeBackendApiUrl("https://api.example.test/")).toBe(
      "https://api.example.test/api",
    );
    expect(
      createBackendUrl(
        "https://api.example.test/api/",
        "/api/articles",
      ).toString(),
    ).toBe("https://api.example.test/api/articles");
  });

  it.each(["sections", "/sections", "api/sections", "/api/sections"])(
    "accepts the internal endpoint form %s",
    (endpoint) => {
      expect(
        createBackendUrl("http://127.0.0.1:8000/api/", endpoint).toString(),
      ).toBe("http://127.0.0.1:8000/api/sections");
    },
  );

  it("encodes query values and omits absent values", () => {
    expect(
      createBackendUrl("https://api.example.test", "/articles?sort=latest", {
        search: "a & b",
        page: 2,
        active: true,
        empty: undefined,
      }).toString(),
    ).toBe(
      "https://api.example.test/api/articles?sort=latest&search=a+%26+b&page=2&active=true",
    );
  });

  it("rejects absolute and protocol-relative endpoint paths", () => {
    expect(() =>
      createBackendUrl("https://api.example.test", "https://bad.test"),
    ).toThrow();
    expect(() =>
      createBackendUrl("https://api.example.test", "//bad.test"),
    ).toThrow();
    expect(() =>
      createBackendUrl("https://api.example.test", " javascript:alert(1)"),
    ).toThrow();
    expect(() =>
      createBackendUrl("https://api.example.test", "/sections#fragment"),
    ).toThrow();
  });
});
