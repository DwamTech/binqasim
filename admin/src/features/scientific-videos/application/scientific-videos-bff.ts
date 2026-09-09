import {
  apiFailure,
  apiSuccess,
  type ApiErrorCode,
  type ApiResponse,
} from "@/core/api/api-response";
import type { ServerApiClient } from "@/core/api/server-api-client.core";
import {
  createScientificVideoFormData,
  parseScientificVideoFormData,
  scientificVideoDeleteSchema,
  scientificVideoDetailSchema,
  scientificVideoMutationSchema,
  scientificVideoOptionsSchema,
  scientificVideoPageSchema,
  scientificVideoQuerySchema,
  validateScientificVideoForm,
} from "../domain/scientific-videos";
import { presentScientificVideo } from "./scientific-videos.presenter";

export type ScientificVideoBffResponse = { status: number; body: object };
const auth = (token: string) => ({ authorization: `Bearer ${token}` });
const validId = (id: string) => (/^[1-9]\d*$/.test(id) ? id : null);

function response(
  result: ApiResponse<unknown>,
  successStatus = 200,
): ScientificVideoBffResponse {
  return {
    status: result.success ? successStatus : (result.error.status ?? 503),
    body: result,
  };
}

function failure(
  status: number,
  fieldErrors?: Record<string, string[]>,
): ScientificVideoBffResponse {
  const code: ApiErrorCode =
    status === 401
      ? "AUTH_SESSION_EXPIRED"
      : status === 403
        ? "AUTH_FORBIDDEN"
        : status === 400
          ? "REQUEST_BODY_INVALID"
          : "VALIDATION_FAILED";
  return {
    status,
    body: apiFailure(code, { status, ...(fieldErrors ? { fieldErrors } : {}) }),
  };
}

async function validatedForm(request: Request, update: boolean) {
  let incoming: FormData;
  try {
    incoming = await request.formData();
  } catch {
    return { success: false as const, response: failure(400) };
  }
  const parsed = parseScientificVideoFormData(incoming);
  if (!parsed) return { success: false as const, response: failure(422) };
  const errors = validateScientificVideoForm(
    parsed.values,
    parsed.files,
    undefined,
    update,
  );
  if (Object.keys(errors).length)
    return { success: false as const, response: failure(422, errors) };
  return {
    success: true as const,
    body: createScientificVideoFormData(parsed.values, parsed.files),
  };
}

export async function listScientificVideos(
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<ScientificVideoBffResponse> {
  if (!token) return failure(401);
  const parsed = scientificVideoQuerySchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams.entries()),
  );
  if (!parsed.success) return failure(422);
  const result = await client.request("/admin/scientific-videos/items", {
    ...auth(token),
    query: parsed.data,
    responseSchema: scientificVideoPageSchema,
    cache: "no-store",
  });
  return response(
    result.success
      ? apiSuccess(
          {
            ...result.data,
            data: result.data.data.map(presentScientificVideo),
          },
          result.meta?.requestId,
        )
      : result,
  );
}

export async function getScientificVideo(
  id: string,
  client: ServerApiClient,
  token?: string,
): Promise<ScientificVideoBffResponse> {
  if (!token) return failure(401);
  const itemId = validId(id);
  if (!itemId) return failure(404);
  const result = await client.request(
    `/admin/scientific-videos/items/${itemId}`,
    {
      ...auth(token),
      responseSchema: scientificVideoDetailSchema,
      cache: "no-store",
    },
  );
  return response(
    result.success
      ? apiSuccess(presentScientificVideo(result.data), result.meta?.requestId)
      : result,
  );
}

export async function createScientificVideo(
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<ScientificVideoBffResponse> {
  if (!token) return failure(401);
  const form = await validatedForm(request, false);
  if (!form.success) return form.response;
  const result = await client.request("/admin/scientific-videos/items", {
    method: "POST",
    ...auth(token),
    body: form.body,
    responseSchema: scientificVideoMutationSchema,
    cache: "no-store",
    timeoutMs: 180_000,
  });
  return response(
    result.success
      ? apiSuccess(
          { ...result.data, data: presentScientificVideo(result.data.data) },
          result.meta?.requestId,
        )
      : result,
    201,
  );
}

export async function updateScientificVideo(
  id: string,
  request: Request,
  client: ServerApiClient,
  token?: string,
): Promise<ScientificVideoBffResponse> {
  if (!token) return failure(401);
  const itemId = validId(id);
  if (!itemId) return failure(404);
  const form = await validatedForm(request, true);
  if (!form.success) return form.response;
  const result = await client.request(
    `/admin/scientific-videos/items/${itemId}`,
    {
      method: "POST",
      multipartMethodOverride: "PATCH",
      ...auth(token),
      body: form.body,
      responseSchema: scientificVideoMutationSchema,
      cache: "no-store",
      timeoutMs: 180_000,
    },
  );
  return response(
    result.success
      ? apiSuccess(
          { ...result.data, data: presentScientificVideo(result.data.data) },
          result.meta?.requestId,
        )
      : result,
  );
}

export async function deleteScientificVideo(
  id: string,
  client: ServerApiClient,
  token?: string,
): Promise<ScientificVideoBffResponse> {
  if (!token) return failure(401);
  const itemId = validId(id);
  if (!itemId) return failure(404);
  return response(
    await client.request(`/admin/scientific-videos/items/${itemId}`, {
      method: "DELETE",
      ...auth(token),
      responseSchema: scientificVideoDeleteSchema,
      cache: "no-store",
    }),
  );
}

export async function getScientificVideoOptions(
  client: ServerApiClient,
  token?: string,
): Promise<ScientificVideoBffResponse> {
  if (!token) return failure(401);
  return response(
    await client.request("/admin/scientific-videos/options", {
      ...auth(token),
      responseSchema: scientificVideoOptionsSchema,
      cache: "no-store",
    }),
  );
}

export function scientificVideoHttpResponse(
  result: ScientificVideoBffResponse,
): Response {
  return Response.json(result.body, {
    status: result.status,
    headers: { "cache-control": "no-store" },
  });
}
