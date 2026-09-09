import { describe, expect, it } from "vitest";

import { verifyCsrfToken } from "./csrf-contract";

describe("verifyCsrfToken", () => {
  it("returns a controlled failure when a token is missing", () => {
    expect(
      verifyCsrfToken({ expectedToken: "expected", providedToken: null }),
    ).toEqual({ ok: false, reason: "missing_csrf_token" });
  });

  it("returns a controlled failure when a token is invalid", () => {
    expect(
      verifyCsrfToken({ expectedToken: "expected", providedToken: "wrong" }),
    ).toEqual({ ok: false, reason: "invalid_csrf_token" });
  });

  it("accepts a matching token", () => {
    expect(
      verifyCsrfToken({ expectedToken: "expected", providedToken: "expected" }),
    ).toEqual({ ok: true });
  });
});
