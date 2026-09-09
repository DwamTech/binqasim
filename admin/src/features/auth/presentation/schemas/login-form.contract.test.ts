import { describe, expect, it } from "vitest";

import {
  createLoginFallbackRequest,
  loginFormContract,
} from "./login-form.contract";

describe("login form transport contract", () => {
  it("uses a same-origin POST action even when hydration is unavailable", async () => {
    const request = createLoginFallbackRequest(
      { identity: "actor@example.com", password: "private-password" },
      "https://cms.example.com/login",
    );
    const url = new URL(request.url);

    expect(loginFormContract).toEqual({
      action: "/api/auth/login",
      method: "post",
    });
    expect(request.method).toBe("POST");
    expect(request.headers.get("content-type")).toContain(
      "application/x-www-form-urlencoded",
    );
    expect(url.origin).toBe("https://cms.example.com");
    expect(url.pathname).toBe("/api/auth/login");
    expect(url.search).toBe("");
    expect(request.url).not.toContain("actor%40example.com");
    expect(request.url).not.toContain("private-password");
    expect(await request.text()).toContain("identity=");
  });
});
