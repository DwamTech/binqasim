import { describe, expect, it, vi } from "vitest";

import {
  createBffLoginSubmitHandler,
  mapBffLoginFailure,
  submitLoginToBff,
} from "../../../../app/(public)/login/_components/login-bff.client";
import { navigateToDashboard } from "../../../../app/(public)/login/_components/login-navigation.client";

const credentials = { identity: "admin@example.com", password: "password" };
const admin = {
  id: "admin-1",
  name: "مدير النظام",
  email: "admin@example.com",
  role: "admin" as const,
  isActive: true as const,
  dashboardPermissions: [],
};

function response(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function nonJsonResponse(body: string, status = 500): Response {
  return new Response(body, { status });
}

describe("login BFF presentation adapter", () => {
  it("submits credentials to the existing same-origin BFF endpoint", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(response({ success: true, data: { actor: admin } }));

    await expect(
      submitLoginToBff(credentials, fetcher as typeof fetch),
    ).resolves.toEqual({ success: true });
    expect(fetcher).toHaveBeenCalledWith("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(credentials),
      credentials: "same-origin",
    });
  });

  it("navigates to the dashboard only after BFF success", async () => {
    const navigate = vi.fn();
    const submit = createBffLoginSubmitHandler(
      navigate,
      vi
        .fn()
        .mockResolvedValue(
          response({ success: true, data: { actor: admin } }),
        ) as typeof fetch,
    );

    await expect(submit(credentials)).resolves.toEqual({ success: true });
    expect(navigate).toHaveBeenCalledOnce();
  });

  it("uses replace-style browser navigation", () => {
    const replace = vi.fn();

    navigateToDashboard({ replace });

    expect(replace).toHaveBeenCalledOnce();
    expect(replace).toHaveBeenCalledWith("/dashboard");
  });

  it("does not navigate after invalid credentials", async () => {
    const navigate = vi.fn();
    const submit = createBffLoginSubmitHandler(
      navigate,
      vi.fn().mockResolvedValue(
        response(
          {
            success: false,
            error: { code: "AUTH_INVALID_CREDENTIALS", message: "ignored" },
          },
          401,
        ),
      ) as typeof fetch,
    );

    await expect(submit(credentials)).resolves.toMatchObject({
      success: false,
      code: "INVALID_CREDENTIALS",
    });
    expect(navigate).not.toHaveBeenCalled();
  });

  it("rejects a non-2xx success-shaped payload without navigation", async () => {
    const navigate = vi.fn();
    const submit = createBffLoginSubmitHandler(
      navigate,
      vi
        .fn()
        .mockResolvedValue(
          response({ success: true, data: { actor: admin } }, 500),
        ) as typeof fetch,
    );

    await expect(submit(credentials)).resolves.toMatchObject({
      success: false,
      code: "UNKNOWN_ERROR",
    });
    expect(navigate).not.toHaveBeenCalled();
  });

  it("normalizes a non-2xx BFF failure without navigation", async () => {
    const navigate = vi.fn();
    const submit = createBffLoginSubmitHandler(
      navigate,
      vi.fn().mockResolvedValue(
        response(
          {
            success: false,
            error: { code: "RATE_LIMIT_EXCEEDED", message: "ignored" },
          },
          429,
        ),
      ) as typeof fetch,
    );

    await expect(submit(credentials)).resolves.toMatchObject({
      success: false,
      code: "RATE_LIMITED",
    });
    expect(navigate).not.toHaveBeenCalled();
  });

  it.each([
    [new Response(null, { status: 500 }), "empty"],
    [nonJsonResponse("not json"), "non-JSON"],
    [response({ success: true }, 200), "malformed"],
  ])("degrades a %s response safely", async (invalidResponse) => {
    await expect(
      submitLoginToBff(
        credentials,
        vi.fn().mockResolvedValue(invalidResponse) as typeof fetch,
      ),
    ).resolves.toMatchObject({ success: false, code: "UNKNOWN_ERROR" });
  });

  it.each([
    [{ success: true, data: {} }, "a success response without admin"],
    [
      { success: true, data: { actor: null } },
      "a success response with null admin",
    ],
    [
      { success: true, data: { actor: { ...admin, role: "user" } } },
      "a success response with malformed admin",
    ],
    [
      { success: true, data: { actor: { ...admin, email: "" } } },
      "a success response with an empty admin field",
    ],
  ])("rejects %s without navigation", async (payload, description) => {
    expect(description).toBeTypeOf("string");
    const navigate = vi.fn();
    const submit = createBffLoginSubmitHandler(
      navigate,
      vi.fn().mockResolvedValue(response(payload)) as typeof fetch,
    );

    await expect(submit(credentials)).resolves.toMatchObject({
      success: false,
      code: "UNKNOWN_ERROR",
    });
    expect(navigate).not.toHaveBeenCalled();
  });

  it.each([
    ["AUTH_INVALID_CREDENTIALS", "INVALID_CREDENTIALS"],
    ["VALIDATION_FAILED", "INVALID_CREDENTIALS"],
    ["AUTH_ACCOUNT_DISABLED", "ACCOUNT_DISABLED"],
    ["AUTH_ACCOUNT_LOCKED", "ACCOUNT_LOCKED"],
    ["RATE_LIMIT_EXCEEDED", "RATE_LIMITED"],
    ["REQUEST_TIMEOUT", "NETWORK_ERROR"],
    ["NETWORK_UNAVAILABLE", "NETWORK_ERROR"],
    ["BACKEND_UNAVAILABLE", "UNKNOWN_ERROR"],
    ["INVALID_BACKEND_RESPONSE", "UNKNOWN_ERROR"],
    ["UNKNOWN_ERROR", "UNKNOWN_ERROR"],
  ] as const)("maps %s to %s", (bffCode, loginCode) => {
    expect(mapBffLoginFailure(bffCode)).toMatchObject({
      success: false,
      code: loginCode,
    });
  });

  it.each([
    "AUTH_INVALID_CREDENTIALS",
    "VALIDATION_FAILED",
    "AUTH_ACCOUNT_DISABLED",
    "AUTH_ACCOUNT_LOCKED",
    "RATE_LIMIT_EXCEEDED",
    "REQUEST_TIMEOUT",
    "NETWORK_UNAVAILABLE",
    "BACKEND_UNAVAILABLE",
    "INVALID_BACKEND_RESPONSE",
    "UNKNOWN_ERROR",
  ] as const)("does not navigate for %s", async (bffCode) => {
    const navigate = vi.fn();
    const submit = createBffLoginSubmitHandler(
      navigate,
      vi.fn().mockResolvedValue(
        response({
          success: false,
          error: { code: bffCode, message: "ignored" },
        }),
      ) as typeof fetch,
    );

    await expect(submit(credentials)).resolves.toMatchObject({
      success: false,
    });
    expect(navigate).not.toHaveBeenCalled();
  });

  it("maps rejected network requests without navigating", async () => {
    const navigate = vi.fn();
    const submit = createBffLoginSubmitHandler(
      navigate,
      vi.fn().mockRejectedValue(new Error("offline")) as typeof fetch,
    );

    await expect(submit(credentials)).resolves.toMatchObject({
      success: false,
      code: "NETWORK_ERROR",
    });
    expect(navigate).not.toHaveBeenCalled();
  });
});
