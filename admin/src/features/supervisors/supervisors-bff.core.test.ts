import { describe, expect, it, vi } from "vitest";

import { apiFailure, apiSuccess } from "../../core/api/api-response";
import type { ServerApiClient } from "../../core/api/server-api-client.core";
import {
  changeSupervisorPassword,
  createSupervisor,
  deleteSupervisor,
  getSupervisor,
  getSupervisorCatalogs,
  listSupervisors,
  setSupervisorActive,
  updateSupervisor,
} from "./supervisors-bff.core";

const supervisor = {
  id: "2",
  name: "Editor",
  email: "editor@example.test",
  role: "editor",
  is_active: true,
  dashboard_permissions: ["books.manage"],
};

function mockClient(...results: unknown[]) {
  const call = vi.fn();
  for (const result of results.length ? results : [apiSuccess({})])
    call.mockResolvedValueOnce(result);
  return {
    call,
    client: { request: call } as unknown as ServerApiClient,
  };
}

const jsonRequest = (body: unknown) =>
  new Request("https://cms.test/api/supervisors", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

describe("supervisors BFF", () => {
  it("forwards server-side list filters and converts active status for Laravel", async () => {
    const page = {
      current_page: 2,
      data: [supervisor],
      last_page: 2,
      per_page: 20,
      total: 21,
    };
    const { client, call } = mockClient(apiSuccess(page));
    const result = await listSupervisors(
      new Request(
        "https://cms.test/api/supervisors?search=edit&role=editor&is_active=false&permission=books.manage&page=2",
      ),
      client,
      "private-token",
    );
    expect(result.status).toBe(200);
    expect(call).toHaveBeenCalledWith(
      "/admin/supervisors",
      expect.objectContaining({
        authorization: "Bearer private-token",
        query: {
          search: "edit",
          role: "editor",
          is_active: 0,
          permission: "books.manage",
          page: 2,
        },
      }),
    );
    expect(JSON.stringify(result.body)).not.toContain("private-token");
  });

  it("forwards create with a password but never returns it", async () => {
    const { client, call } = mockClient(apiSuccess({ user: supervisor }));
    const result = await createSupervisor(
      jsonRequest({
        name: "Editor",
        email: "editor@example.test",
        role: "editor",
        is_active: true,
        dashboard_permissions: ["books.manage"],
        password: "password123",
        password_confirmation: "password123",
      }),
      client,
      "token",
    );
    expect(result.status).toBe(201);
    expect(call).toHaveBeenCalledWith(
      "/admin/supervisors",
      expect.objectContaining({ method: "POST" }),
    );
    expect(JSON.stringify(result.body)).not.toContain("password123");
  });

  it("forwards detail update activation deletion and password methods", async () => {
    const detail = mockClient(apiSuccess(supervisor));
    await getSupervisor("2", detail.client, "token");
    expect(detail.call).toHaveBeenCalledWith(
      "/admin/supervisors/2",
      expect.objectContaining({ authorization: "Bearer token" }),
    );

    const update = mockClient(apiSuccess({ user: supervisor }));
    await updateSupervisor(
      "2",
      jsonRequest({
        name: "Editor",
        email: "editor@example.test",
        role: "reviewer",
        is_active: true,
        dashboard_permissions: ["reports.view"],
      }),
      update.client,
      "token",
    );
    expect(update.call).toHaveBeenCalledWith(
      "/admin/supervisors/2",
      expect.objectContaining({ method: "PATCH" }),
    );

    const activation = mockClient(apiSuccess({ user: supervisor }));
    await setSupervisorActive("2", false, activation.client, "token");
    expect(activation.call).toHaveBeenCalledWith(
      "/admin/supervisors/2/deactivate",
      expect.objectContaining({ method: "POST" }),
    );

    const deletion = mockClient(apiSuccess({ message: "disabled" }));
    await deleteSupervisor("2", deletion.client, "token");
    expect(deletion.call).toHaveBeenCalledWith(
      "/admin/supervisors/2",
      expect.objectContaining({ method: "DELETE" }),
    );

    const password = mockClient(apiSuccess({ message: "changed" }));
    const passwordResult = await changeSupervisorPassword(
      "2",
      jsonRequest({
        password: "password123",
        password_confirmation: "password123",
      }),
      password.client,
      "token",
    );
    expect(password.call).toHaveBeenCalledWith(
      "/admin/supervisors/2/change-password",
      expect.objectContaining({ method: "POST" }),
    );
    expect(JSON.stringify(passwordResult.body)).not.toContain("password123");
  });

  it("loads canonical role and permission catalogs from Admin endpoints", async () => {
    const { client, call } = mockClient(
      apiSuccess(["admin", "editor", "author", "reviewer"]),
      apiSuccess([{ key: "books.manage", label: "Books Manage" }]),
    );
    expect((await getSupervisorCatalogs(client, "token")).status).toBe(200);
    expect(call.mock.calls.map(([endpoint]) => endpoint)).toEqual([
      "/admin/roles",
      "/admin/permissions",
    ]);
  });

  it("starts independent catalog requests in parallel", async () => {
    let releaseRoles:
      ((value: ReturnType<typeof apiSuccess<string[]>>) => void) | undefined;
    const roles = new Promise<ReturnType<typeof apiSuccess<string[]>>>(
      (resolve) => {
        releaseRoles = resolve;
      },
    );
    const call = vi
      .fn()
      .mockReturnValueOnce(roles)
      .mockResolvedValueOnce(
        apiSuccess([{ key: "books.manage", label: "Books Manage" }]),
      );
    const pending = getSupervisorCatalogs(
      { request: call } as unknown as ServerApiClient,
      "token",
    );

    expect(call.mock.calls.map(([endpoint]) => endpoint)).toEqual([
      "/admin/roles",
      "/admin/permissions",
    ]);
    releaseRoles?.(apiSuccess(["admin", "editor", "author", "reviewer"]));
    await expect(pending).resolves.toMatchObject({ status: 200 });
  });

  it("fails closed for missing session malformed ids payloads and backend errors", async () => {
    expect(
      (
        await listSupervisors(
          new Request("https://cms.test/api/supervisors"),
          mockClient().client,
        )
      ).status,
    ).toBe(401);
    expect(
      (await getSupervisor("../2", mockClient().client, "token")).status,
    ).toBe(422);
    expect(
      (
        await createSupervisor(
          jsonRequest({ role: "root" }),
          mockClient().client,
          "token",
        )
      ).status,
    ).toBe(422);
    for (const status of [403, 404, 409, 422, 429, 500]) {
      const code =
        status === 403
          ? "AUTH_FORBIDDEN"
          : status === 422
            ? "VALIDATION_FAILED"
            : "UNKNOWN_ERROR";
      const result = await getSupervisor(
        "2",
        mockClient(apiFailure(code, { status })).client,
        "token",
      );
      expect(result.status).toBe(status);
    }
  });
});
