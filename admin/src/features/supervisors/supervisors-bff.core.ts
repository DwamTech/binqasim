import {
  apiFailure,
  apiSuccess,
  type ApiResponse,
} from "../../core/api/api-response";
import type { ServerApiClient } from "../../core/api/server-api-client.core";
import {
  createSupervisorSchema,
  editSupervisorSchema,
  passwordChangeSchema,
  permissionCatalogSchema,
  roleCatalogSchema,
  supervisorDeleteResponseSchema,
  supervisorMessageResponseSchema,
  supervisorMutationResponseSchema,
  supervisorPageSchema,
  supervisorQuerySchema,
  supervisorSchema,
} from "./supervisors.contracts";

export type SupervisorsBffResponse = { status: number; body: object };

function response(result: ApiResponse<unknown>, successStatus = 200) {
  return {
    status: result.success ? successStatus : (result.error.status ?? 503),
    body: result,
  } satisfies SupervisorsBffResponse;
}

function failure(status: number): SupervisorsBffResponse {
  const code =
    status === 401
      ? "AUTH_SESSION_EXPIRED"
      : status === 403
        ? "AUTH_FORBIDDEN"
        : "VALIDATION_FAILED";
  return { status, body: apiFailure(code, { status }) };
}

async function json(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

const auth = (token: string) => ({ authorization: `Bearer ${token}` });
const validId = (id: string) => (/^[1-9]\d*$/.test(id) ? id : null);

export async function listSupervisors(
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<SupervisorsBffResponse> {
  if (!token) return failure(401);
  const url = new URL(request.url);
  const query = supervisorQuerySchema.safeParse({
    ...(url.searchParams.get("search")
      ? { search: url.searchParams.get("search") }
      : {}),
    ...(url.searchParams.get("role")
      ? { role: url.searchParams.get("role") }
      : {}),
    ...(url.searchParams.get("is_active")
      ? { is_active: url.searchParams.get("is_active") }
      : {}),
    ...(url.searchParams.get("permission")
      ? { permission: url.searchParams.get("permission") }
      : {}),
    ...(url.searchParams.get("page")
      ? { page: url.searchParams.get("page") }
      : {}),
  });
  if (!query.success) return failure(422);
  const backendQuery = {
    ...query.data,
    ...(query.data.is_active
      ? { is_active: query.data.is_active === "true" ? 1 : 0 }
      : {}),
  };
  return response(
    await client.request("/admin/supervisors", {
      ...auth(token),
      query: backendQuery,
      responseSchema: supervisorPageSchema,
      cache: "no-store",
    }),
  );
}

export async function createSupervisor(
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<SupervisorsBffResponse> {
  if (!token) return failure(401);
  const input = createSupervisorSchema.safeParse(await json(request));
  if (!input.success) return failure(422);
  return response(
    await client.request("/admin/supervisors", {
      method: "POST",
      ...auth(token),
      body: input.data,
      responseSchema: supervisorMutationResponseSchema,
      cache: "no-store",
    }),
    201,
  );
}

export async function getSupervisor(
  id: string,
  client: ServerApiClient,
  token?: string,
): Promise<SupervisorsBffResponse> {
  if (!token) return failure(401);
  const supervisorId = validId(id);
  if (!supervisorId) return failure(422);
  return response(
    await client.request(`/admin/supervisors/${supervisorId}`, {
      ...auth(token),
      responseSchema: supervisorSchema,
      cache: "no-store",
    }),
  );
}

export async function updateSupervisor(
  id: string,
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<SupervisorsBffResponse> {
  if (!token) return failure(401);
  const supervisorId = validId(id);
  if (!supervisorId) return failure(422);
  const input = editSupervisorSchema.safeParse(await json(request));
  if (!input.success) return failure(422);
  return response(
    await client.request(`/admin/supervisors/${supervisorId}`, {
      method: "PATCH",
      ...auth(token),
      body: input.data,
      responseSchema: supervisorMutationResponseSchema,
      cache: "no-store",
    }),
  );
}

export async function changeSupervisorPassword(
  id: string,
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<SupervisorsBffResponse> {
  if (!token) return failure(401);
  const supervisorId = validId(id);
  if (!supervisorId) return failure(422);
  const input = passwordChangeSchema.safeParse(await json(request));
  if (!input.success) return failure(422);
  return response(
    await client.request(`/admin/supervisors/${supervisorId}/change-password`, {
      method: "POST",
      ...auth(token),
      body: input.data,
      responseSchema: supervisorMessageResponseSchema,
      cache: "no-store",
    }),
  );
}

export async function setSupervisorActive(
  id: string,
  active: boolean,
  client: ServerApiClient,
  token?: string,
): Promise<SupervisorsBffResponse> {
  if (!token) return failure(401);
  const supervisorId = validId(id);
  if (!supervisorId) return failure(422);
  return response(
    await client.request(
      `/admin/supervisors/${supervisorId}/${active ? "activate" : "deactivate"}`,
      {
        method: "POST",
        ...auth(token),
        responseSchema: supervisorMutationResponseSchema,
        cache: "no-store",
      },
    ),
  );
}

export async function deleteSupervisor(
  id: string,
  client: ServerApiClient,
  token?: string,
): Promise<SupervisorsBffResponse> {
  if (!token) return failure(401);
  const supervisorId = validId(id);
  if (!supervisorId) return failure(422);
  return response(
    await client.request(`/admin/supervisors/${supervisorId}`, {
      method: "DELETE",
      ...auth(token),
      responseSchema: supervisorDeleteResponseSchema,
      cache: "no-store",
    }),
  );
}

export async function getSupervisorCatalogs(
  client: ServerApiClient,
  token?: string,
): Promise<SupervisorsBffResponse> {
  if (!token) return failure(401);
  const [roles, permissions] = await Promise.all([
    client.request("/admin/roles", {
      ...auth(token),
      responseSchema: roleCatalogSchema,
      cache: "no-store",
    }),
    client.request("/admin/permissions", {
      ...auth(token),
      responseSchema: permissionCatalogSchema,
      cache: "no-store",
    }),
  ]);
  if (!roles.success) return response(roles);
  if (!permissions.success) return response(permissions);
  return response(
    apiSuccess({ roles: roles.data, permissions: permissions.data }),
  );
}

export function toSupervisorsHttpResponse(
  result: SupervisorsBffResponse,
): Response {
  return Response.json(result.body, {
    status: result.status,
    headers: { "cache-control": "no-store" },
  });
}
