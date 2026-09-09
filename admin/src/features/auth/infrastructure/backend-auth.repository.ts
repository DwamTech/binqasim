import "server-only";

import { z } from "zod";

import {
  serverApiClient,
  type ApiErrorCode,
  type ServerApiClient,
} from "@/core/api/server-api-client";
import {
  dashboardPermissions,
  type AdminSessionResult,
  type AdminSummary,
  type LoginCredentials,
} from "../domain/auth.contracts";
import type { AuthRepository } from "../domain/auth.repository";

const adminRoleSchema = z.enum(["admin", "editor", "author", "reviewer"]);
const dashboardPermissionSchema = z.enum(dashboardPermissions);
const sanctumTokenSchema = z.string().trim().min(1).max(4096);
const adminSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    email: z.string().email(),
    role: adminRoleSchema,
    is_active: z.literal(true),
    dashboard_permissions: z.array(dashboardPermissionSchema),
  })
  .transform((actor) => ({
    id: actor.id,
    name: actor.name,
    email: actor.email,
    role: actor.role,
    isActive: true as const,
    dashboardPermissions: actor.dashboard_permissions,
  }));
const laravelLoginSchema = z
  .object({
    message: z.string(),
    actor: adminSchema,
    token: sanctumTokenSchema,
    token_type: z.literal("Bearer"),
  })
  .transform(({ actor, token }): AdminSessionResult => ({
    admin: actor,
    token,
  }));

export const backendAuthPaths = {
  currentAdmin: "/dashboard/me",
  login: "/dashboard/login",
  logout: "/dashboard/logout",
} as const;

export class BackendAuthRepositoryError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    readonly status?: number,
  ) {
    super("The backend authentication service could not complete the request.");
    this.name = "BackendAuthRepositoryError";
  }
}

function unwrap<T>(
  response: Awaited<ReturnType<ServerApiClient["request"]>>,
): T {
  if (!response.success) {
    throw new BackendAuthRepositoryError(
      response.error.code,
      response.error.status,
    );
  }

  return response.data as T;
}

/**
 * Backend paths are centralized here until the backend publishes a formal
 * endpoint specification. This module is server-only and never returns its
 * upstream session ID or any backend credentials to browser callers.
 */
export class BackendAuthRepository implements AuthRepository {
  constructor(private readonly apiClient: ServerApiClient = serverApiClient) {}

  async login(credentials: LoginCredentials): Promise<AdminSessionResult> {
    const response = await this.apiClient.request(backendAuthPaths.login, {
      method: "POST",
      body: credentials,
      responseSchema: laravelLoginSchema,
    });

    return unwrap<AdminSessionResult>(response);
  }

  async logout(token: string): Promise<void> {
    const response = await this.apiClient.request(backendAuthPaths.logout, {
      method: "POST",
      authorization: `Bearer ${token}`,
    });

    unwrap(response);
  }

  async getCurrentAdmin(token: string): Promise<AdminSummary> {
    const response = await this.apiClient.request(
      backendAuthPaths.currentAdmin,
      {
        authorization: `Bearer ${token}`,
        responseSchema: z.object({ actor: adminSchema }),
      },
    );

    return unwrap<{ actor: AdminSummary }>(response).actor;
  }
}
