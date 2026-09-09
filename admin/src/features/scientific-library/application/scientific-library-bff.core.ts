import {
  apiFailure,
  apiSuccess,
  type ApiErrorCode,
  type ApiResponse,
} from "@/core/api/api-response";
import type { ServerApiClient } from "@/core/api/server-api-client.core";
import {
  scientificLibraryDeleteResponseSchema,
  scientificLibraryDetailResponseSchema,
  scientificLibraryMutationResponseSchema,
  scientificLibraryOptionsResponseSchema,
  scientificLibraryPageSchema,
  scientificLibraryQuerySchema,
} from "../domain/scientific-library.schemas";
import {
  createScientificLibraryFormData,
  readScientificLibraryFormData,
  validateScientificLibraryForm,
} from "./scientific-library.form";
import { presentScientificLibraryItem } from "./scientific-library-item.presenter";

export type ScientificLibraryBffResponse = { status: number; body: object };

const auth = (token: string) => ({ authorization: `Bearer ${token}` });

function response(
  result: ApiResponse<unknown>,
  successStatus = 200,
): ScientificLibraryBffResponse {
  return {
    status: result.success ? successStatus : (result.error.status ?? 503),
    body: result,
  };
}

function failure(
  status: number,
  fieldErrors?: Record<string, string[]>,
): ScientificLibraryBffResponse {
  const code: ApiErrorCode =
    status === 401
      ? "AUTH_SESSION_EXPIRED"
      : status === 403
        ? "AUTH_FORBIDDEN"
        : status === 429
          ? "RATE_LIMIT_EXCEEDED"
          : status === 400
            ? "REQUEST_BODY_INVALID"
            : "VALIDATION_FAILED";
  return {
    status,
    body: apiFailure(code, {
      status,
      ...(fieldErrors ? { fieldErrors } : {}),
    }),
  };
}

function validId(id: string): string | null {
  return /^[1-9]\d*$/.test(id) ? id : null;
}

async function validatedFormData(
  request: Request,
  mode: "create" | "update",
): Promise<
  | { success: true; body: FormData }
  | { success: false; response: ScientificLibraryBffResponse }
> {
  let incoming: FormData;
  try {
    incoming = await request.formData();
  } catch {
    return { success: false, response: failure(400) };
  }
  const parsed = readScientificLibraryFormData(incoming);
  if (!parsed) return { success: false, response: failure(422) };
  const errors = validateScientificLibraryForm(
    parsed.values,
    parsed.files,
    undefined,
    mode === "update",
  );
  if (Object.keys(errors).length)
    return { success: false, response: failure(422, errors) };
  return {
    success: true,
    body: createScientificLibraryFormData(parsed.values, parsed.files),
  };
}

export async function listScientificLibraryItems(
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<ScientificLibraryBffResponse> {
  if (!token) return failure(401);
  const parsed = scientificLibraryQuerySchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams.entries()),
  );
  if (!parsed.success) return failure(422);
  const result = await client.request("/admin/scientific-library/items", {
    ...auth(token),
    query: parsed.data,
    responseSchema: scientificLibraryPageSchema,
    cache: "no-store",
  });
  return response(
    result.success
      ? apiSuccess(
          {
            ...result.data,
            data: result.data.data.map((item) =>
              presentScientificLibraryItem(item),
            ),
          },
          result.meta?.requestId,
        )
      : result,
  );
}

export async function getScientificLibraryItem(
  id: string,
  client: ServerApiClient,
  token?: string,
): Promise<ScientificLibraryBffResponse> {
  if (!token) return failure(401);
  const itemId = validId(id);
  if (!itemId) return failure(404);
  const result = await client.request(
    `/admin/scientific-library/items/${itemId}`,
    {
      ...auth(token),
      responseSchema: scientificLibraryDetailResponseSchema,
      cache: "no-store",
    },
  );
  return response(
    result.success
      ? apiSuccess(
          presentScientificLibraryItem(result.data),
          result.meta?.requestId,
        )
      : result,
  );
}

export async function createScientificLibraryItem(
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<ScientificLibraryBffResponse> {
  if (!token) return failure(401);
  const form = await validatedFormData(request, "create");
  if (!form.success) return form.response;
  const result = await client.request("/admin/scientific-library/items", {
    method: "POST",
    ...auth(token),
    body: form.body,
    responseSchema: scientificLibraryMutationResponseSchema,
    cache: "no-store",
    timeoutMs: 120_000,
  });
  return response(
    result.success
      ? apiSuccess(
          {
            ...result.data,
            data: presentScientificLibraryItem(result.data.data),
          },
          result.meta?.requestId,
        )
      : result,
    201,
  );
}

export async function updateScientificLibraryItem(
  id: string,
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<ScientificLibraryBffResponse> {
  if (!token) return failure(401);
  const itemId = validId(id);
  if (!itemId) return failure(404);
  const form = await validatedFormData(request, "update");
  if (!form.success) return form.response;
  const result = await client.request(
    `/admin/scientific-library/items/${itemId}`,
    {
      method: "POST",
      multipartMethodOverride: "PATCH",
      ...auth(token),
      body: form.body,
      responseSchema: scientificLibraryMutationResponseSchema,
      cache: "no-store",
      timeoutMs: 120_000,
    },
  );
  return response(
    result.success
      ? apiSuccess(
          {
            ...result.data,
            data: presentScientificLibraryItem(result.data.data),
          },
          result.meta?.requestId,
        )
      : result,
  );
}

export async function deleteScientificLibraryItem(
  id: string,
  client: ServerApiClient,
  token?: string,
): Promise<ScientificLibraryBffResponse> {
  if (!token) return failure(401);
  const itemId = validId(id);
  if (!itemId) return failure(404);
  return response(
    await client.request(`/admin/scientific-library/items/${itemId}`, {
      method: "DELETE",
      ...auth(token),
      responseSchema: scientificLibraryDeleteResponseSchema,
      cache: "no-store",
    }),
  );
}

export async function getScientificLibraryOptions(
  client: ServerApiClient,
  token?: string,
): Promise<ScientificLibraryBffResponse> {
  if (!token) return failure(401);
  return response(
    await client.request("/admin/scientific-library/options", {
      ...auth(token),
      responseSchema: scientificLibraryOptionsResponseSchema,
      cache: "no-store",
    }),
  );
}

export function toScientificLibraryHttpResponse(
  result: ScientificLibraryBffResponse,
): Response {
  return Response.json(result.body, {
    status: result.status,
    headers: { "cache-control": "no-store" },
  });
}
