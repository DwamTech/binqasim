import { z } from "zod";

import { apiFailure, type ApiResponse } from "../../core/api/api-response";
import type { ServerApiClient } from "../../core/api/server-api-client.core";

export type AccountBffResponse = {
  status: number;
  body: object;
};

const profileInputSchema = z.strictObject({
  name: z.string().trim().min(2).max(255),
  email: z.string().trim().email().max(255),
});

const passwordInputSchema = z
  .strictObject({
    current_password: z.string().min(1).max(1024),
    password: z.string().min(8).max(1024),
    password_confirmation: z.string().min(1).max(1024),
  })
  .refine((data) => data.password === data.password_confirmation, {
    path: ["password_confirmation"],
    message: "Passwords do not match.",
  });

const accountResponseSchema = z.object({
  message: z.string(),
  account: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    role: z.string(),
  }),
});

const passwordResponseSchema = z.object({ message: z.string() });

function responseStatus(result: ApiResponse<unknown>): number {
  return result.success ? 200 : (result.error.status ?? 503);
}

function response(result: ApiResponse<unknown>): AccountBffResponse {
  return { status: responseStatus(result), body: result };
}

function unauthenticated(): AccountBffResponse {
  return {
    status: 401,
    body: apiFailure("AUTH_SESSION_EXPIRED", { status: 401 }),
  };
}

function invalidInput(): AccountBffResponse {
  return {
    status: 422,
    body: apiFailure("VALIDATION_FAILED", { status: 422 }),
  };
}

async function parsePayload(request: Request): Promise<unknown | undefined> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

export async function handleProfileUpdate(
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<AccountBffResponse> {
  if (token === undefined) return unauthenticated();
  const input = profileInputSchema.safeParse(await parsePayload(request));
  if (!input.success) return invalidInput();

  return response(
    await client.request("/dashboard/account/profile", {
      method: "PATCH",
      body: input.data,
      authorization: `Bearer ${token}`,
      responseSchema: accountResponseSchema,
      cache: "no-store",
    }),
  );
}

export async function handlePasswordUpdate(
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<AccountBffResponse> {
  if (token === undefined) return unauthenticated();
  const input = passwordInputSchema.safeParse(await parsePayload(request));
  if (!input.success) return invalidInput();

  return response(
    await client.request("/dashboard/account/password", {
      method: "PUT",
      body: input.data,
      authorization: `Bearer ${token}`,
      responseSchema: passwordResponseSchema,
      cache: "no-store",
    }),
  );
}

export function toAccountHttpResponse(result: AccountBffResponse): Response {
  return Response.json(result.body, {
    status: result.status,
    headers: { "cache-control": "no-store" },
  });
}
