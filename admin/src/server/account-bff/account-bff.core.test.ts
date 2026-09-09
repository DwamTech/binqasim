import { describe, expect, it, vi } from "vitest";

import { apiSuccess } from "../../core/api/api-response";
import type { ServerApiClient } from "../../core/api/server-api-client.core";

import { handlePasswordUpdate, handleProfileUpdate } from "./account-bff.core";

function request(body: unknown): Request {
  return new Request("https://dashboard.test/api/account", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function clientReturning(data: unknown) {
  const call = vi.fn().mockResolvedValue(apiSuccess(data));
  return {
    call,
    client: { request: call } as unknown as ServerApiClient,
  };
}

describe("account BFF", () => {
  it("requires the server-side session token before calling Laravel", async () => {
    const { client, call } = clientReturning({});
    const result = await handleProfileUpdate(
      request({ name: "Admin User", email: "admin@example.com" }),
      client,
    );

    expect(result.status).toBe(401);
    expect(call).not.toHaveBeenCalled();
  });

  it("forwards only validated profile fields with bearer authorization", async () => {
    const backend = {
      message: "updated",
      account: {
        id: "1",
        name: "Admin User",
        email: "admin@example.com",
        role: "admin",
      },
    };
    const { client, call } = clientReturning(backend);

    const result = await handleProfileUpdate(
      request({
        name: "  Admin User ",
        email: "admin@example.com",
        role: "super_admin",
      }),
      client,
      "private-token",
    );

    expect(result.status).toBe(422);
    expect(call).not.toHaveBeenCalled();

    await handleProfileUpdate(
      request({ name: "  Admin User ", email: "admin@example.com" }),
      client,
      "private-token",
    );
    expect(call).toHaveBeenCalledWith(
      "/dashboard/account/profile",
      expect.objectContaining({
        method: "PATCH",
        body: { name: "Admin User", email: "admin@example.com" },
        authorization: "Bearer private-token",
      }),
    );
  });

  it("rejects mismatched passwords before Laravel is called", async () => {
    const { client, call } = clientReturning({ message: "updated" });
    const result = await handlePasswordUpdate(
      request({
        current_password: "Old-password1",
        password: "New-password2",
        password_confirmation: "different",
      }),
      client,
      "private-token",
    );

    expect(result.status).toBe(422);
    expect(call).not.toHaveBeenCalled();
  });
});
