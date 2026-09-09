import { describe, expect, it } from "vitest";

import type { LoginRateLimiter } from "./rate-limit";

describe("LoginRateLimiter", () => {
  it("supports an allowed result", async () => {
    const limiter: LoginRateLimiter = {
      check: async () => ({ allowed: true }),
    };

    await expect(limiter.check({ key: "198.51.100.10" })).resolves.toEqual({
      allowed: true,
    });
  });

  it("supports a blocked result", async () => {
    const limiter: LoginRateLimiter = {
      check: async () => ({ allowed: false, retryAfterSeconds: 60 }),
    };

    await expect(limiter.check({ key: "198.51.100.10" })).resolves.toEqual({
      allowed: false,
      retryAfterSeconds: 60,
    });
  });
});
