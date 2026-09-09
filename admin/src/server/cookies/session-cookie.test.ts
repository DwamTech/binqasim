import { describe, expect, it } from "vitest";

import {
  createSessionCookieClearOptions,
  createSessionCookieOptions,
  sanctumTokenLifetimeSeconds,
  sessionCookieName,
} from "./session-cookie";

describe("session cookie options", () => {
  it("always creates HttpOnly cookies", () => {
    expect(createSessionCookieOptions(false).httpOnly).toBe(true);
  });

  it("uses secure cookies in production", () => {
    expect(createSessionCookieOptions(true).secure).toBe(true);
  });

  it("centralizes the Sanctum-compatible 24-hour, host-only contract", () => {
    expect(sessionCookieName).toBe("cms_session");
    expect(createSessionCookieOptions(false)).toEqual({
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: sanctumTokenLifetimeSeconds,
    });
    expect(sanctumTokenLifetimeSeconds).toBe(86400);
  });

  it("clears cookies with the same path and sameSite contract", () => {
    const options = createSessionCookieClearOptions(true);

    expect(options).toMatchObject({
      maxAge: 0,
      path: "/",
      sameSite: "lax",
      secure: true,
    });
  });
});
