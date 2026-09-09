import { apiFailure, type ApiResponse } from "../../core/api/api-response";
import type { ServerApiClient } from "../../core/api/server-api-client.core";

import {
  businessSettingsSchema,
  familyUpdateResponseSchema,
  messageResponseSchema,
  phoneSettingsSchema,
  siteContactSchema,
  siteContactUpdateResponseSchema,
  siteContactUpdateSchema,
  siteStatusSchema,
  siteStatusUpdateResponseSchema,
  socialSettingsSchema,
  supportBulkUpdateSchema,
  supportSettingsSchema,
  supportSettingUpdateSchema,
  systemContentKeys,
  systemContentSchema,
  systemContentUpdateResponseSchema,
  systemContentUpdateSchema,
  type SystemContentKey,
} from "./settings.contracts";

export type SettingsBffResponse = { status: number; body: object };

function response(
  result: ApiResponse<unknown>,
  successStatus = 200,
): SettingsBffResponse {
  return {
    status: result.success ? successStatus : (result.error.status ?? 503),
    body: result,
  };
}

function failure(status: number): SettingsBffResponse {
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

function authorization(token: string) {
  return { authorization: `Bearer ${token}` };
}

export async function getContact(
  client: ServerApiClient,
  token?: string,
): Promise<SettingsBffResponse> {
  if (!token) return failure(401);
  return response(
    await client.request("/admin/site-contact", {
      ...authorization(token),
      responseSchema: siteContactSchema,
      cache: "no-store",
    }),
  );
}

export async function updateContact(
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<SettingsBffResponse> {
  if (!token) return failure(401);
  const input = siteContactUpdateSchema.safeParse(await json(request));
  if (!input.success) return failure(422);
  return response(
    await client.request("/admin/site-contact", {
      method: "PUT",
      ...authorization(token),
      body: input.data,
      responseSchema: siteContactUpdateResponseSchema,
      cache: "no-store",
    }),
  );
}

const contactFamilies = {
  social: {
    schema: socialSettingsSchema,
    endpoint: "/admin/site-contact/social",
  },
  phones: {
    schema: phoneSettingsSchema,
    endpoint: "/admin/site-contact/phones",
  },
  business: {
    schema: businessSettingsSchema,
    endpoint: "/admin/site-contact/business",
  },
} as const;

export type ContactFamily = keyof typeof contactFamilies;

export async function updateContactFamily(
  family: string,
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<SettingsBffResponse> {
  if (!token) return failure(401);
  if (!(family in contactFamilies)) return failure(404);
  const contract = contactFamilies[family as ContactFamily];
  const input = contract.schema.safeParse(await json(request));
  if (!input.success) return failure(422);
  return response(
    await client.request(contract.endpoint, {
      method: "PUT",
      ...authorization(token),
      body: input.data,
      responseSchema: familyUpdateResponseSchema,
      cache: "no-store",
    }),
  );
}

export async function getSupport(
  client: ServerApiClient,
  token?: string,
): Promise<SettingsBffResponse> {
  if (!token) return failure(401);
  return response(
    await client.request("/admin/support/settings/update-all", {
      ...authorization(token),
      responseSchema: supportSettingsSchema,
      cache: "no-store",
    }),
  );
}

export async function updateSupport(
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<SettingsBffResponse> {
  if (!token) return failure(401);
  const input = supportSettingUpdateSchema.safeParse(await json(request));
  if (!input.success) return failure(422);
  return response(
    await client.request("/admin/support/settings/update", {
      method: "POST",
      ...authorization(token),
      body: { key: input.data.key, value: String(input.data.value) },
      responseSchema: messageResponseSchema,
      cache: "no-store",
    }),
  );
}

export async function updateSupportBulk(
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<SettingsBffResponse> {
  if (!token) return failure(401);
  const input = supportBulkUpdateSchema.safeParse(await json(request));
  if (!input.success) return failure(422);
  return response(
    await client.request("/admin/support/settings/update-all", {
      method: "POST",
      ...authorization(token),
      body: { value: String(input.data.value) },
      responseSchema: messageResponseSchema,
      cache: "no-store",
    }),
  );
}

export async function getSiteStatus(
  client: ServerApiClient,
  token?: string,
): Promise<SettingsBffResponse> {
  if (!token) return failure(401);
  const adminSettings = await client.request(
    "/admin/support/settings/update-all",
    {
      ...authorization(token),
      responseSchema: supportSettingsSchema,
      cache: "no-store",
    },
  );
  if (!adminSettings.success) return response(adminSettings);
  return response({
    success: true,
    data: siteStatusSchema.parse({ status: adminSettings.data.site_status }),
  });
}

export async function updateSiteStatus(
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<SettingsBffResponse> {
  if (!token) return failure(401);
  const input = siteStatusSchema.safeParse(await json(request));
  if (!input.success) return failure(422);
  return response(
    await client.request("/admin/site/status", {
      method: "POST",
      ...authorization(token),
      body: input.data,
      responseSchema: siteStatusUpdateResponseSchema,
      cache: "no-store",
    }),
  );
}

function supportedContentKey(key: string): key is SystemContentKey {
  return systemContentKeys.includes(key as SystemContentKey);
}

async function authorizeAdminRead(
  client: ServerApiClient,
  token: string,
): Promise<ApiResponse<unknown>> {
  return client.request("/admin/support/settings/update-all", {
    ...authorization(token),
    responseSchema: supportSettingsSchema,
    cache: "no-store",
  });
}

export async function getSystemContent(
  key: string,
  client: ServerApiClient,
  token?: string,
): Promise<SettingsBffResponse> {
  if (!token) return failure(401);
  if (!supportedContentKey(key)) return failure(404);
  const authorizationResult = await authorizeAdminRead(client, token);
  if (!authorizationResult.success) return response(authorizationResult);
  return response(
    await client.request(`/system-content/${key}`, {
      responseSchema: systemContentSchema,
      cache: "no-store",
    }),
  );
}

export async function updateSystemContent(
  key: string,
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<SettingsBffResponse> {
  if (!token) return failure(401);
  if (!supportedContentKey(key)) return failure(404);
  const input = systemContentUpdateSchema.safeParse(await json(request));
  if (!input.success) return failure(422);
  return response(
    await client.request(`/admin/system-content/${key}`, {
      method: "POST",
      ...authorization(token),
      body: input.data,
      responseSchema: systemContentUpdateResponseSchema,
      cache: "no-store",
    }),
  );
}

export function toSettingsHttpResponse(result: SettingsBffResponse): Response {
  return Response.json(result.body, {
    status: result.status,
    headers: { "cache-control": "no-store" },
  });
}
