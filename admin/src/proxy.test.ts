import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { proxy } from "./proxy";

describe("proxy", () => {
  it("redirects a guest from dashboard without calling a backend client", () => {
    const response = proxy(
      new NextRequest("https://cms.example.com/dashboard"),
    );

    expect(response.headers.get("location")).toBe(
      "https://cms.example.com/login?next=%2Fdashboard",
    );
  });

  it("redirects a request with a session cookie away from login", () => {
    const response = proxy(
      new NextRequest("https://cms.example.com/login", {
        headers: { cookie: "cms_session=session-1" },
      }),
    );

    expect(response.headers.get("location")).toBe(
      "https://cms.example.com/dashboard",
    );
  });

  it("keeps login available when no session cookie is present", () => {
    const response = proxy(new NextRequest("https://cms.example.com/login"));

    expect(response.headers.get("location")).toBeNull();
  });
});
