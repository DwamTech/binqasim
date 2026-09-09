import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/core/api/server-api-client", () => ({ serverApiClient: {} }));

import { createServerApiClient } from "../../../core/api/server-api-client.core";

import {
  BackendAuthRepository,
  BackendAuthRepositoryError,
  backendAuthPaths,
} from "./backend-auth.repository";

const loginPayload = {
  message: "Dashboard login successful.",
  token: "1|sanctum-token-value",
  token_type: "Bearer",
  actor: {
    id: "1",
    name: "Admin",
    email: "admin@example.com",
    role: "admin",
    is_active: true,
    dashboard_permissions: [],
  },
};

function createRepository(payload: unknown) {
  const fetch = vi
    .fn<typeof globalThis.fetch>()
    .mockResolvedValue(Response.json(payload));
  return {
    fetch,
    repository: new BackendAuthRepository(
      createServerApiClient({
        baseUrl: () => "https://backend.example.com",
        fetch,
      }),
    ),
  };
}

describe("BackendAuthRepository Laravel contract", () => {
  it("maps the Laravel admin login response without exposing token fields", async () => {
    const { fetch, repository } = createRepository(loginPayload);

    await expect(
      repository.login({ identity: "admin@example.com", password: "password" }),
    ).resolves.toMatchObject({
      admin: expect.objectContaining({ id: loginPayload.actor.id }),
      token: loginPayload.token,
    });
    expect(fetch).toHaveBeenCalledWith(
      new URL(backendAuthPaths.login, "https://backend.example.com"),
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("accepts additive module permissions from the canonical backend catalog", async () => {
    const { repository } = createRepository({
      ...loginPayload,
      actor: {
        ...loginPayload.actor,
        dashboard_permissions: ["library_indexes.manage", "tour_guides.manage"],
      },
    });
    await expect(
      repository.login({ identity: "admin@example.com", password: "password" }),
    ).resolves.toMatchObject({
      admin: {
        dashboardPermissions: ["library_indexes.manage", "tour_guides.manage"],
      },
    });
  });

  it("forwards the bearer token only from server-side repository methods", async () => {
    const fetch = vi
      .fn<typeof globalThis.fetch>()
      .mockResolvedValueOnce(Response.json({ actor: loginPayload.actor }))
      .mockResolvedValueOnce(
        Response.json({ message: "Admin logout successful." }),
      );
    const repository = new BackendAuthRepository(
      createServerApiClient({
        baseUrl: () => "https://backend.example.com",
        fetch,
      }),
    );

    await expect(
      repository.getCurrentAdmin(loginPayload.token),
    ).resolves.toMatchObject({ id: loginPayload.actor.id });
    await repository.logout(loginPayload.token);
    expect(
      new Headers(fetch.mock.calls[0]?.[1]?.headers).get("authorization"),
    ).toBe(`Bearer ${loginPayload.token}`);
    expect(
      new Headers(fetch.mock.calls[1]?.[1]?.headers).get("authorization"),
    ).toBe(`Bearer ${loginPayload.token}`);
  });

  it("rejects a success body missing the Laravel token", async () => {
    const { repository } = createRepository({
      ...loginPayload,
      token: undefined,
    });
    await expect(
      repository.login({ identity: "admin@example.com", password: "password" }),
    ).rejects.toBeInstanceOf(BackendAuthRepositoryError);
  });

  it.each([401, 403, 422, 429, 500, 503])(
    "preserves Laravel failure status %i for the BFF policy",
    async (status) => {
      const fetch = vi
        .fn<typeof globalThis.fetch>()
        .mockResolvedValue(Response.json({ message: "failed" }, { status }));
      const repository = new BackendAuthRepository(
        createServerApiClient({
          baseUrl: () => "https://backend.example.com",
          fetch,
        }),
      );
      await expect(
        repository.login({ identity: "admin", password: "password" }),
      ).rejects.toMatchObject({ status });
    },
  );
});
