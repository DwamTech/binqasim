import { describe, expect, it } from "vitest";

import { isSameOriginMutation } from "./same-origin-request";

describe("same-origin BFF mutations", () => {
  it("accepts the route origin", () => {
    expect(
      isSameOriginMutation(
        new Request("https://cms.example.com/api/auth/login", {
          headers: { origin: "https://cms.example.com" },
        }),
      ),
    ).toBe(true);
  });

  it("uses the configured public origin behind a reverse proxy", () => {
    expect(
      isSameOriginMutation(
        new Request("http://127.0.0.1:3012/api/auth/login", {
          headers: { origin: "https://admin.innovators-sa.com" },
        }),
        "https://admin.innovators-sa.com",
      ),
    ).toBe(true);
  });

  it("does not trust a different browser origin behind a reverse proxy", () => {
    expect(
      isSameOriginMutation(
        new Request("http://127.0.0.1:3012/api/auth/login", {
          headers: { origin: "https://evil.example.com" },
        }),
        "https://admin.innovators-sa.com",
      ),
    ).toBe(false);
  });

  it.each([
    "https://evil.example.com",
    "http://cms.example.com",
    "https://cms.example.com:444",
  ])("rejects %s before credentials can be forwarded", (origin) => {
    expect(
      isSameOriginMutation(
        new Request("https://cms.example.com/api/auth/logout", {
          headers: { origin },
        }),
      ),
    ).toBe(false);
  });

  it("rejects a missing Origin", () => {
    expect(
      isSameOriginMutation(
        new Request("https://cms.example.com/api/auth/login"),
      ),
    ).toBe(false);
  });
});
